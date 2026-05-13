#include "files.h"

#include <cjson/cJSON.h>
#include <dirent.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "../../../webDriver/src/utils/utils.h"
#include "../../utils/utils.h"

void create_entity(struct mg_connection *c, struct mg_http_message *hm, int type) {
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

    const cJSON *projectName = cJSON_GetObjectItemCaseSensitive(json, "projectName");
    const cJSON *path = cJSON_GetObjectItemCaseSensitive(json, "path");

    if (!cJSON_IsString(projectName) || (projectName->valuestring == NULL) ||
        !cJSON_IsString(path) || (path->valuestring == NULL)) {
        cJSON_Delete(json);
        error_response(c, 400, "Missing or invalid 'projectName' or 'path' field");
        return;
    }

    char *home = getenv("HOME");
    if (!home) {
        cJSON_Delete(json);
        error_response(c, 500, "HOME environment variable not set");
        return;
    }

    char full_path[2048];
    snprintf(full_path, sizeof(full_path), "%s/Documents/Nora/%s/%s", home, projectName->valuestring,
             path->valuestring);

    if (type == 0) {
        // Create file
        FILE *f = fopen(full_path, "w");
        if (f) {
            fclose(f);
            mg_http_reply(c, 200, DEFAULT_TEXT_HEADER, "File created successfully");
        } else {
            error_response(c, 500, "Failed to create file");
        }
    } else {
        // Create folder
        if (mkdir_p(full_path) == 0) {
            mg_http_reply(c, 200, DEFAULT_TEXT_HEADER, "Folder created successfully");
        } else {
            error_response(c, 500, "Failed to create folder");
        }
    }

    cJSON_Delete(json);
}

void create_file(struct mg_connection *c, struct mg_http_message *hm) {
    create_entity(c, hm, 0);
}

void create_folder(struct mg_connection *c, struct mg_http_message *hm) {
    create_entity(c, hm, 1);
}

void get_file(struct mg_connection *c, struct mg_http_message *hm) {
    char project_name[256];
    if (mg_http_get_var(&hm->query, "projectName", project_name, sizeof(project_name)) <= 0) {
        error_response(c, 400, "Missing 'projectName' query parameter");
        return;
    }

    char file_path[2048];
    if (mg_http_get_var(&hm->query, "path", file_path, sizeof(file_path)) <= 0) {
        error_response(c, 400, "Missing 'projectName' query parameter");
        return;
    }

    char *home = getenv("HOME");
    if (!home) {
        error_response(c, 500, "HOME environment variable not set");
        return;
    }

    char full_path[4096];
    snprintf(full_path, sizeof(full_path), "%s/Documents/Nora/%s/%s", home, project_name, file_path);

    FILE *f = fopen(full_path, "r");
    if (f) {
        fseek(f, 0, SEEK_END);
        long fsize = ftell(f);
        fseek(f, 0, SEEK_SET);

        char *content = malloc(fsize + 1);
        if (content) {
            fread(content, 1, fsize, f);
            content[fsize] = '\0';
            cJSON *response_json = cJSON_CreateObject();
            cJSON_AddStringToObject(response_json, "content", content);
            char *response = cJSON_Print(response_json);
            cJSON_Delete(response_json);
            mg_http_reply(c, 200, DEFAULT_JSON_HEADER, "%s", response);
            free(response);
            free(content);
        } else {
            error_response(c, 500, "Memory allocation failed");
        }
        fclose(f);
    } else {
        error_response(c, 404, "File not found");
    }
}

int update_text_file(FILE *file, const cJSON *content) {
    fwrite(content->valuestring, 1, strlen(content->valuestring), file);
    DEBUG("Updated text file with content: %s", content->valuestring);
    return 1;
}

int update_wobj_file(FILE *file, const cJSON *content) {
    // just to verify
    cJSON *data = cJSON_Parse(content->valuestring);
    if (!data) {
        return 0;
    }

    fwrite(content->valuestring, 1, strlen(content->valuestring), file);

    cJSON_Delete(data);
    DEBUG("Updated .wobj file with content: %s", content->valuestring);
    return 1;
}

void update_file(struct mg_connection *c, struct mg_http_message *hm) {
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

    const cJSON *projectName = cJSON_GetObjectItemCaseSensitive(json, "projectName");
    const cJSON *path = cJSON_GetObjectItemCaseSensitive(json, "path");
    const cJSON *content = cJSON_GetObjectItemCaseSensitive(json, "content");

    if (!cJSON_IsString(projectName) || (projectName->valuestring == NULL) ||
        !cJSON_IsString(path) || (path->valuestring == NULL) ||
        !cJSON_IsString(content) || (content->valuestring == NULL)) {
        cJSON_Delete(json);
        error_response(c, 400, "Missing or invalid 'projectName', 'path' or 'content' field");
        return;
    }

    char *home = getenv("HOME");
    if (!home) {
        cJSON_Delete(json);
        error_response(c, 500, "HOME environment variable not set");
        return;
    }

    char full_path[2048];
    snprintf(full_path, sizeof(full_path), "%s/Documents/Nora/%s/%s", home, projectName->valuestring,
             path->valuestring);

    DEBUG("Updating file at path: %s", full_path);
    char extension[16];
    const char *dot = strrchr(path->valuestring, '.');
    if (dot && strlen(dot) < sizeof(extension)) {
        strncpy(extension, dot + 1, sizeof(extension) - 1);
        extension[sizeof(extension) - 1] = '\0';
    } else {
        strcpy(extension, "txt");
    }
    DEBUG("Extension %s", extension);

    FILE *f = fopen(full_path, "w");
    if (!f) {
        error_response(c, 404, "File not found");
        cJSON_Delete(json);
        return;
    }

    int result = 0;
    if (strcmp(extension, "wobj") == 0) {
        result = update_wobj_file(f, content);
    } else {
        result = update_text_file(f, content);
    }

    fclose(f);
    if (result) {
        mg_http_reply(c, 200, DEFAULT_TEXT_HEADER, "File updated successfully");
    } else {
        error_response(c, 500, "Failed to update file");
    }

    cJSON_Delete(json);
}
