#ifndef NORA_C_FILES_H
#define NORA_C_FILES_H

#include "../../../lib/Mongoose/mongoose.h"

void create_file(struct mg_connection *c, struct mg_http_message *hm);
void create_folder(struct mg_connection *c, struct mg_http_message *hm);
void get_file(struct mg_connection *c, struct mg_http_message *hm);
void update_file(struct mg_connection *c, struct mg_http_message *hm);

#endif //NORA_C_FILES_H