export type BlueToothDevice =
	{
		deviceId : string,
		name : string,
		RSSI : number,
		localName : string,
		advertisServiceUUIDs : string[],
		advertisData : {}
	}

export type BlueToothService = {
	uuid : string,
	isPrimary : boolean
}

export type BlueToothCharacteristic = {
	uuid : string,
	properties : {
		read : boolean,
		write : boolean,
		notify : boolean,
		indicate : boolean
	}
}