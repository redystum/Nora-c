#include <stdio.h>
#include "run.h"

/*
 to run a file
 1. get the wscene file
 2. get all C files on the project
 3. check the #$ on C for match lines on wscene
 4. copy the function bellow #$ to a real .c file
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

int run(struct mg_connection *c, const cJSON *content, const char *type) {
    DEBUG("Type: %s", type);

    if (strcmp(type, "run_all_files") == 0) {
        DEBUG("Running all files");
        // TODO
    } else if (strcmp(type, "run_file") == 0) {
        DEBUG("Running file");
        char *projectName = cJSON_GetStringValue(cJSON_GetObjectItem(content, "projectName"));
        char *filePath = cJSON_GetStringValue(cJSON_GetObjectItem(content, "path"));

        char *content = NULL;

        int r = get_file_content(&content, projectName, filePath);
        if (r < 0) {
            DEBUG("Failed to get file content for project: %s, path: %s", projectName, filePath);
            ws_response(c, WS_ERROR, "Failed to get file content");
            return -1;
        }

        DEBUG("File content: %s", content);


    }

    struct mg_str response = mg_str("Hello from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    return 0;
}
