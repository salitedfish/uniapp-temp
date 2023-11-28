export type UploadMedia = Partial<{
	name : string,
	size : number,
	thumb : string,
	type : string,
	url : string,
	status : "uploading" | "success" | "fail",
	message : string
}>

export type UploadFile = Partial<{
	file : any,
	path : string,
	name : string,
	size : number,
	progress : number,
	type : "loading" | "success" | "fail",
	remotePath : string,
}>