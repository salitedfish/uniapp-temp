import { getBaseUrl } from "../util/env"
import { URequest } from "./init"

export const uRequest = new URequest({ baseUrl: getBaseUrl() })