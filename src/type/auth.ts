export type UserInfo = {
	orgId : string,
	token : string,
	jobNo : string,
	jobName : string,
	fullPathId : string,
	fullPathName : string,
	deptName : string,
	updateTime : string,
	menusRoles : string,
	menusDingdingRole : string,
	buttonsRoles : string,
	configList : {
		id : string,
		title : string,
		value : string,
		type : string,
		rank : number,
		webUse : string,
		status : string
	}[],
	config : string,
	loginSource : string,
	ip : string
}