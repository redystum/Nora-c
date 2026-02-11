#ifndef NORA_C_BACKEND_H
#define NORA_C_BACKEND_H

#include <signal.h>
#include "../shared/shared.h"
#include "../lib/Mongoose/mongoose.h"
#include "../webDriver/src/utils/utils.h"

typedef enum {
    NORA_GET,
    NORA_POST,
} methods_t;

typedef struct {
    char *path;
    void (*fun)(struct mg_connection *c, struct mg_http_message *hm);
    methods_t method;
} controller_t;

extern volatile sig_atomic_t keep_running;

void *start_backend(void *arg);

#endif //NORA_C_BACKEND_H
