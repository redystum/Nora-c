#ifndef NORA_C_PROJECTS_H
#define NORA_C_PROJECTS_H

#include "../../../lib/Mongoose/mongoose.h"

void get_projects(struct mg_connection *c, struct mg_http_message *hm);

#endif //NORA_C_PROJECTS_H