// 对应的指令 请到手册查询
const esc = (item) => {

}
const cpcl = (item) => {
	let string = '';
	//模板字符串 自带换行符 \n (也可以用字符串拼接 每行指令结尾 + \n)
	// 字符串拼接：! 0 200 200 210 1\n TEXT 0 0 250 0 test\n PRINT\n
	string += `! 0 ${item.width} ${item.height} 210 1
			TEXT 0 0 50 0 标题1：${item.title1} ${item.title2}
			TEXT 0 0 50 40 标题2：${item.title2} 标题3：${item.title3}
			VB QR 50 60 M 2 U 6
			${item.id}
			ENDQR
			PRINT
			`;
	return string;
}

const tspl = (item) => {
	let string = '';
	//模板字符串 自带换行符 \n (也可以用字符串拼接 每行指令结尾 + \n)
	// 字符串拼接：SIZE 100mm, 100mm\n TEXT 250,0,"TSS24.BF2",0,1,1,"test"\n PRINT 1\n
	string += `SIZE ${item.width}mm, ${item.height}mm
		GAP 3mm, 0mm
		DIRECTION 1
		CLS
		TEXT 50,0,"TSS24.BF2",0,1,1,"标题1：${item.title1} ${item.title2}"
		TEXT 50,40,"TSS24.BF2",0,1,1,"标题2：${item.title2} 标题3：${item.title3}"
		QRCODE 50,60,H,6,A,0,"${item.id}"
		PRINT 1
		`;
	return string;
}

const commands = (type, item) => {
	switch (type) {
		case 'esc':
			return esc(item);
		case 'cpcl':
			return cpcl(item);
		case 'tspl':
			return tspl(item);
		default:
			return 'HELLO WORLD';
	}
}
export {
	commands
}