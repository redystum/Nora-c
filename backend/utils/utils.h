#ifndef NORA_C_UTILS_H
#define NORA_C_UTILS_H

#include "../../lib/Mongoose/mongoose.h"

#define CORS "Access-Control-Allow-Origin: *\r\n"
#define DEFAULT_JSON_HEADER CORS "Content-Type: application/json\r\n"
#define DEFAULT_TEXT_HEADER CORS "Content-Type: text/plain\r\n"

int mkdir_p(const char *path);
void error_response(struct mg_connection *c, int status_code, const char *message);

#endif //NORA_C_UTILS_H