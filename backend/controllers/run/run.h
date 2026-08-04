#ifndef RUN_H
#define RUN_H

#include "../../../lib/Mongoose/mongoose.h"
#include "../../utils/utils.h"

int run(struct mg_connection *c , struct mg_ws_message *wm);

#endif // RUN_H
