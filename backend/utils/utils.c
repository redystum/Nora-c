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
