import type { DefaultEventsMap, Server } from "socket.io";
import { User } from "../models/user";

export type ServerWithUser = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  User
>;

interface AcknowledgementSuccessPayload<Data = any> {
  status: "success";
  data?: Data;
}

interface AcknowledgementErrorPayload {
  status: "error";
  error: string;
}

export type Acknowledgement<AckData = any> = (
  payload: AcknowledgementSuccessPayload<AckData> | AcknowledgementErrorPayload
) => void;
