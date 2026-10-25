import { app } from "./app";
import { env } from "./utils/env";

app.listen(env.port, () => {
  console.log(`AutoFlow API listening on http://localhost:${env.port}`);
  console.log(`Accepting requests from ${env.clientUrl}`);
});
