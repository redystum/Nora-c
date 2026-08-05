#include <stdio.h>
#include "run.h"

/*
 to run a file
 1. get the wscene file
 2. get all C files on the project
 3. check the $ on C for match lines on wscene
 4. copy the function bellow $ to a real .c file
 5. do 3. and 4. until all wscenes
 5.1 if missing c functions give warning with function template and abort
 6. compile the C file with nora webdriver
 7. run compiled


 for all scenes, just repeat 3. to 5. until all files parsed

 */

int get_file_content(char **content, char *project, char *file_path) {
    char *home = getenv("HOME");
    if (!home) {
        return -1;
    }

    char full_path[4096];
    snprintf(full_path, sizeof(full_path), "%s/Documents/Nora/%s/%s", home, project, file_path);
    DEBUG("Getting file content from path: %s", full_path);

    FILE *f = fopen(full_path, "r");
    if (!f) {
        return -1;
    }

    fseek(f, 0, SEEK_END);
    long fsize = ftell(f);
    fseek(f, 0, SEEK_SET);

    *content = malloc(fsize + 1);
    if (!*content) {
        fclose(f);
        return -1;
    }

    size_t read_bytes = fread(*content, 1, fsize, f);
    (*content)[read_bytes] = '\0';

    fclose(f);
    return 0;
}

int convert_file_in_lines(char ***array, char **content) {
    if (!content || !*content || !array) return 0;

    int capacity = 16;
    int count = 0;

    char **lines = malloc(capacity * sizeof(char *));
    if (!lines) return -1;

    char *line_start = *content;
    char *ptr = *content;

    while (1) {
        if (*ptr == '\n' || *ptr == '\r' || *ptr == '\0') {
            char original_char = *ptr;
            *ptr = '\0';

            trim(line_start);

            if (strlen(line_start) > 0) {
                if (count >= capacity) {
                    capacity *= 2;
                    char **temp = realloc(lines, capacity * sizeof(char *));
                    if (!temp) {
                        free(lines);
                        return -1;
                    }
                    lines = temp;
                }
                lines[count++] = line_start;
            }

            if (original_char == '\0') break;
            line_start = ptr + 1;
        }
        ptr++;
    }

    *array = lines;
    return count;
}

int get_c_files_path(char ***c_files, int *count, char *project) {
    char *home = getenv("HOME");
    if (!home) {
        return -1;
    }

    char project_path[4096];
    snprintf(project_path, sizeof(project_path), "%s/Documents/Nora/%s/scripts", home, project);
    DEBUG("Getting C files from project path: %s", project_path);

    // TODO: recursive folders
    DIR *dir = opendir(project_path);
    if (!dir) {
        return -1;
    }

    struct dirent *entry;
    int c_file_count = 0;
    while ((entry = readdir(dir)) != NULL) {
        if (entry->d_type == DT_REG && strstr(entry->d_name, ".c")) {
            c_file_count++;
        }
    }

    rewinddir(dir);

    *c_files = malloc(c_file_count * sizeof(char *));
    if (!*c_files) {
        closedir(dir);
        return -1;
    }

    int index = 0;
    while ((entry = readdir(dir)) != NULL) {
        if (entry->d_type == DT_REG && strstr(entry->d_name, ".c")) {
            (*c_files)[index] = strdup(entry->d_name);
            index++;
        }
    }

    closedir(dir);
    *count = c_file_count;
    return 0;
}

int match_c_with_scenes(cJSON **scenes, char **content, int content_count, char *project, char **c_files_path, int files_count) {
    int r = 0;
    for (int i = 0; i < files_count; i++) {
        char *file_content = NULL;
        char file_path[4096];
        snprintf(file_path, sizeof(file_path), "scripts/%s", c_files_path[i]);
        r = get_file_content(&file_content, project, file_path);
        if (r < 0) {
            DEBUG("Failed to get file content for C file: %s", c_files_path[i]);
            continue;
        }

        char *ptr = file_content;
        while (ptr != NULL) {
            if (*ptr == '$') {
                DEBUG("\n----\nFound $ in C file: %s\n----\n", c_files_path[i]);

                char *line_start = ptr + 1;
                char *line_end = strchr(line_start, '\n');
                if (line_end == NULL) {
                    continue;
                }
                char *line = NULL;
                size_t line_length = line_end - line_start - 1; // -1 to remove \n
                line = malloc(line_length + 1);
                if (line != NULL) {
                    strncpy(line, line_start + 1, line_length);
                    line[line_length] = '\0';
                }

                DEBUG("Found line in C file: %s, line: '%s'", c_files_path[i], line);

                char *start_func = line_end + 1;
                char *end_func = NULL;

                char *ptr_func = start_func;
                int open_brackets_count = 0;
                while (true) {
                    if (*ptr_func == '{') {
                        open_brackets_count++;
                    } else if (*ptr_func == '}') {
                        open_brackets_count--;
                        if (open_brackets_count == 0) {
                            end_func = ptr_func + 1;
                            break;
                        }
                    }
                    ptr_func++;
                }

                char *function = NULL;
                size_t func_length = end_func - start_func;
                function = malloc(func_length + 1);
                if (function != NULL) {
                    strncpy(function, start_func, func_length);
                    function[func_length] = '\0';
                }

                DEBUG("Found function in C file: %s, function: %s", c_files_path[i], function);

                for (int j = 0; j < content_count; j++) {
                    DEBUG("Comparing line: '%s' with content line: '%s'", line, content[j]);
                    if (content[j] != NULL && strcmp(line, content[j]) == 0) {
                        DEBUG("Matched line: '%s' with C file: %s", line, c_files_path[i]);
                        cJSON *scene = cJSON_CreateObject();
                        cJSON_AddStringToObject(scene, "line", strdup(line));
                        cJSON_AddStringToObject(scene, "c_file", strdup(c_files_path[i]));
                        cJSON_AddStringToObject(scene, "c_function", strdup(function));
                        cJSON_AddItemToArray(*scenes, scene);

                        content[j] = NULL; // matched

                        break;
                    }
                }

                free(line);
                free(function);
            }
            ptr = strchr(ptr, '\n');

            if (ptr != NULL) {
                ptr++;
            }
        }

        free(file_content);
    }

    return 0;
}

int run_file(struct mg_connection *c, const cJSON *ws_content) {
    DEBUG("Running file");
    char *projectName = cJSON_GetStringValue(cJSON_GetObjectItem(ws_content, "projectName"));
    char *filePath = cJSON_GetStringValue(cJSON_GetObjectItem(ws_content, "path"));

    char *content = NULL;

    int r = get_file_content(&content, projectName, filePath);
    if (r < 0) {
        DEBUG("Failed to get file content for project: %s, path: %s, exit code: %i", projectName, filePath, r);
        ws_response(c, WS_ERROR, "Failed to get file content");
        return -1;
    }

    DEBUG("File content: %s", content);

    char **content_array = NULL;
    int content_array_count = 0;
    r = convert_file_in_lines(&content_array, &content);
    if (r < 0) {
        DEBUG("Failed to convert file content to lines for project: %s, path: %s, exit code: %i", projectName, filePath, r);
        ws_response(c, WS_ERROR, "Failed to convert file content to lines");
        free(content);
        return -1;
    }
    content_array_count = r;

#ifdef DEBUG_ENABLED
    for (int i = 0; i < content_array_count; i++) {
        DEBUG("Content line %i: %s", i, content_array[i]);
    }
#endif

    char **c_files_path = NULL;
    int c_file_count = 0;
    r = get_c_files_path(&c_files_path, &c_file_count, projectName);
    if (r < 0) {
        DEBUG("Failed to get C files: %s, path: %s, exit code: %i", projectName, c_files_path, r);
        ws_response(c, WS_ERROR, "Failed to get C files");
    }

    DEBUG("Found %i C files", c_file_count);

#ifdef DEBUG_ENABLED
    for (int i = 0; i < c_file_count; i++) {
        DEBUG("C file %i: %s", i, c_files_path[i]);
    }
#endif


    DEBUG("\n\n------------------\n\n")
    cJSON *scenes = cJSON_CreateArray();
    r = match_c_with_scenes(&scenes, content_array, content_array_count, projectName, c_files_path, c_file_count);
    if (r < 0) {
        DEBUG("Failed to match C files with scenes: %s, path: %s, exit code: %i", projectName, c_files_path, r);
        ws_response(c, WS_ERROR, "Failed to match C files with scenes");
    }

    DEBUG("Found %i matched scenes", cJSON_GetArraySize(scenes));
    DEBUG_JSON(scenes);


    for (int i = 0; i < content_array_count; i++) {
        if (content_array[i] == NULL) {
            continue;
        }

        DEBUG("Content line not match: '%s'", content_array[i]);
        char *msg = NULL;
        asprintf(&msg, "Scene step not found: '%s'\nCreate a function like the example bellow to start:", content_array[i]);
        ws_response(c, WS_ERROR, msg);
        free(msg);

        asprintf(&msg, "$ %s\nvoid your_function_name(){\n\t// TODO\n}", content_array[i]);
        ws_response(c, WS_CODE_ERROR, msg);
        free(msg);
        return -1;
    }

    DEBUG("\n\n------------------\n\n")

    DEBUG("All content lines matched with C files");




    for (int i = 0; i < c_file_count; i++) {
        free(c_files_path[i]);
    }
    free(c_files_path);
    cJSON_Delete(scenes);
    free(content);
    free(content_array);


    return 0;

}

int run(struct mg_connection *c, const cJSON *content, const char *type) {
    DEBUG("Type: %s", type);

    if (strcmp(type, "run_all_files") == 0) {
        DEBUG("Running all files");
        // TODO
    } else if (strcmp(type, "run_file") == 0) {
        return run_file(c, content);
    }

    struct mg_str response = mg_str("Hello from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    return 0;
}
