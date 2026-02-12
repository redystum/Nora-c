#include "utils.h"
#include "../../webDriver/src/utils/utils.h"

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
