#include "utils.h"
#include "../../webDriver/src/utils/utils.h"

#include <cjson/cJSON.h>
#include <sys/stat.h>
#include <string.h>
#include <stdio.h>
#include <errno.h>

int mkdir_p(const char *path) {
    char tmp[1024];
    char *p = NULL;
    size_t len;

    snprintf(tmp, sizeof(tmp), "%s", path);
    len = strlen(tmp);
    if (tmp[len - 1] == '/')
        tmp[len - 1] = 0;

    for (p = tmp + 1; *p; p++) {
        if (*p == '/') {
            *p = 0;
            if (mkdir(tmp, 0755) == -1) {
                if (errno != EEXIST) {
                    DEBUG("Failed to create directory: %s", tmp);
                    return -1;
                }
            }
            *p = '/';
        }
    }
    if (mkdir(tmp, 0755) == -1) {
        if (errno != EEXIST) {
            DEBUG("Failed to create directory: %s", tmp);
            return -1;
        }
    }

    struct stat st = {0};
    if (stat(path, &st) == -1) {
        DEBUG("Directory does not exist after creation: %s", path);
        return -1;
    }

    return 0;
}

void error_response(struct mg_connection *c, int status_code, const char *message) {
    cJSON *response_json = cJSON_CreateObject();
    cJSON_AddNumberToObject(response_json, "status", status_code);
    cJSON_AddStringToObject(response_json, "error", message);

    char* response = cJSON_Print(response_json);
    cJSON_Delete(response_json);
    mg_http_reply(c, status_code, DEFAULT_JSON_HEADER, "%s", response);
    free(response);
}

void ws_response(struct mg_connection *c, ws_msg_type_t type, const char *message) {
    char *response = NULL;
    if (type == WS_NO_FORMAT) {
        response = strdup(message ? message : "");
    } else {
        cJSON *response_json = cJSON_CreateObject();
        cJSON_AddStringToObject(response_json, "type",
                                type == WS_SYSTEM ? "system" :
                                type == WS_INFO ? "info" :
                                type == WS_SUCCESS ? "success" :
                                type == WS_WARNING ? "warning" :
                                type == WS_ERROR ? "error" :
                                type == WS_CODE ? "code" :
                                type == WS_CODE_ERROR ? "code_error" :
                                type == WS_END ? "end" : "unknown");
        cJSON_AddStringToObject(response_json, "message", message ? message : "");
        response = cJSON_PrintUnformatted(response_json);
        cJSON_Delete(response_json);
    }

    if (!response) {
        response = strdup("");
    }
    struct mg_str response_str = mg_str(response);
    mg_ws_send(c, response_str.buf, response_str.len, WEBSOCKET_OP_TEXT);
    free(response);
}

void trim(char *str) {
    if (!str || *str == '\0') return;

    // trailing spaces
    char *end = str + strlen(str) - 1;
    while (end >= str && isspace((unsigned char)*end)) {
        *end = '\0';
        end--;
    }

    // leading spaces
    char *start = str;
    while (*start && isspace((unsigned char)*start)) {
        start++;
    }

    if (start != str) {
        memmove(str, start, strlen(start) + 1);
    }
}