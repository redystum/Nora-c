#ifndef RUN_H
#define RUN_H

#include "../../../lib/Mongoose/mongoose.h"
#include "../../utils/utils.h"

int run(struct mg_connection *c , const cJSON *content, const char *type);

#endif // RUN_H
