#include "projects.h"

#include <cjson/cJSON.h>
#include <dirent.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "../../../webDriver/src/utils/utils.h"
#include "../../utils/utils.h"

void get_projects(struct mg_connection *c, struct mg_http_message *hm) {
    (void) hm;

    cJSON *response_json = cJSON_CreateArray();

    char *home = getenv("HOME");
    if (!home) {
        cJSON_Delete(response_json);
        error_response(c, 500, "HOME environment variable not set");
        return;
    }

    char path[1024];
    snprintf(path, sizeof(path), "%s/Documents/Nora", home);

    DIR *noraDir = opendir(path);
    if (!noraDir) {
        cJSON_Delete(response_json);
        error_response(c, 500, "Failed to open projects directory");
        return;
    }

    struct dirent *dir;
    while ((dir = readdir(noraDir)) != NULL) {
        if (dir->d_type == DT_DIR && strcmp(dir->d_name, ".") != 0 && strcmp(dir->d_name, "..") != 0) {
            char filepath[2048];
            snprintf(filepath, sizeof(filepath), "%s/%s/nora.json", path, dir->d_name);

            FILE *f = fopen(filepath, "r");
            if (f) {
                fseek(f, 0, SEEK_END);
                long length = ftell(f);
                fseek(f, 0, SEEK_SET);

                char *buffer = malloc(length + 1);
                if (buffer) {
                    fread(buffer, 1, length, f);
                    buffer[length] = '\0';

                    cJSON *item = cJSON_Parse(buffer);
                    if (item) {
                        cJSON_AddItemToArray(response_json, item);
                    }
                    free(buffer);
                }
                fclose(f);
            }
        }
    }
    closedir(noraDir);

    char* response = cJSON_Print(response_json);
    cJSON_Delete(response_json);
    mg_http_reply(c, 200, DEFAULT_JSON_HEADER, "%s", response);
    free(response);
}

void create_project(struct mg_connection *c, struct mg_http_message *hm) {
    char *body = malloc(hm->body.len + 1);
    if (!body) {
        error_response(c, 500, "Memory allocation failed");
        return;
    }
    memcpy(body, hm->body.buf, hm->body.len);
    body[hm->body.len] = '\0';

    cJSON *json = cJSON_Parse(body);
    free(body);

    if (!json) {
        error_response(c, 400, "Invalid JSON");
        return;
    }

    const cJSON *name = cJSON_GetObjectItemCaseSensitive(json, "name");
    if (!cJSON_IsString(name) || (name->valuestring == NULL)) {
        cJSON_Delete(json);
        error_response(c, 400, "Missing or invalid 'name' field");
        return;
    }

    char *home = getenv("HOME");
    if (home) {
        char path[1024];
        snprintf(path, sizeof(path), "%s/Documents/Nora/%s", home, name->valuestring);
        DEBUG("%s", path);

        if (mkdir_p(path) == -1) {
            cJSON_Delete(json);
            error_response(c, 500, "Failed to create project directory");
            return;
        }

        char filepath[2048];
        snprintf(filepath, sizeof(filepath), "%s/nora.json", path);

        FILE *f = fopen(filepath, "w");
        if (f) {
            cJSON *project_json = cJSON_CreateObject();
            cJSON_AddStringToObject(project_json, "name", name->valuestring);

            const cJSON *description = cJSON_GetObjectItemCaseSensitive(json, "description");
            if (cJSON_IsString(description) && (description->valuestring != NULL)) {
                cJSON_AddStringToObject(project_json, "description", description->valuestring);
            } else {
                cJSON_AddStringToObject(project_json, "description", "");
            }

            char date[64];
            time_t t = time(NULL);
            struct tm tm = *localtime(&t);
            snprintf(date, sizeof(date), "%04d-%02d-%02d", tm.tm_year + 1900, tm.tm_mon + 1, tm.tm_mday);
            cJSON_AddStringToObject(project_json, "created_at", date);

            char *prj_json_str = cJSON_Print(project_json);
            fprintf(f, "%s", prj_json_str);
            fclose(f);
            cJSON_Delete(project_json);

            char subdirs[4][20] = {"objects", "scenes", "scripts", "reports"};
            for (int i = 0; i < 4; i++) {
                char subdir_path[2048];
                snprintf(subdir_path, sizeof(subdir_path), "%s/%s", path, subdirs[i]);
                if (mkdir_p(subdir_path) == -1) {
                    cJSON_Delete(json);
                    error_response(c, 500, "Failed to create project subdirectories");
                    return;
                }
            }

            mg_http_reply(c, 201, DEFAULT_JSON_HEADER, "%s", prj_json_str);
            free(prj_json_str);
        } else {
            error_response(c, 500, "Failed to create project file");
        }
    } else {
        error_response(c, 500, "HOME environment variable not set");
    }

    cJSON_Delete(json);
}