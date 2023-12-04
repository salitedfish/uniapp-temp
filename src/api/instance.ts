import { getBaseUrl } from "@/util/common"
import { URequest } from "./init"

export const uRequest = new URequest({ baseUrl: getBaseUrl() })