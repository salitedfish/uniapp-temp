// import './encoding.js'; // 如需要 中文乱码问题 new TextEncoder
const printInteraction = {
    device_id: null,// 打印设备id
    service_id: '',
    write_id: '',
    notify_id: '',
    connFlag: false,
    services: [],
    stringData: [],
    callback: function () {},
    ab2hex: (buffer) => {//ArrayBuffer转16进度字符串示例
        const hexArr = Array.prototype.map.call(
            new Uint8Array(buffer),
            function (bit) {
                return ('00' + bit.toString(16)).slice(-2)
            }
        )
        return hexArr.join('')
    },
    // 获取蓝牙状态是否开启 准备
    getBluetooth: (callback) => {
        const _this = printInteraction;
        uni.getBluetoothAdapterState({
            success(res) {
                if (res.available) { // 蓝牙适配器是否可用
                    callback && _this.startSearch(callback)
                } else {
                    uni.showToast({
                        title: '本机蓝牙不可用',
                        duration: 2000,
                        icon: 'none'
                    });
                }
            },
            fail(err) {
                uni.showToast({
                    title: '本机蓝牙不可用',
                    duration: 2000,
                    icon: 'none'
                });
            }
        });
    },
    // 初始化蓝牙
    init: () => {
        const _this = printInteraction;
        uni.openBluetoothAdapter({
            success(res) {
                uni.getBluetoothAdapterState({
                    success(res) {
                        if (res.available) { // 蓝牙适配器是否可用
                            if (res.discovering) { // 蓝牙适配器是否处于搜索状态
                                //  立即停止搜索 节约电
                                _this.stopSearch();
                            }
                        }
                    }
                });
            },
            fail(err) {
                setTimeout(function () {
                    uni.showToast({
                        title: '蓝牙打开失败，请打开蓝牙',
                        duration: 2000,
                        icon: 'none'
                    });
                }, 200)
            }
        })
    },
    // 搜索附近蓝牙，并获取蓝牙列表
    startSearch: (callback) => {
        const _this = printInteraction;
        uni.showLoading({
            title: '正在搜索...'
        });
        uni.startBluetoothDevicesDiscovery({ // 开始搜索蓝牙设备
            allowDuplicatesKey: true,
            powerLevel: 'high',
            success(res) {
                setTimeout(function () {
                    uni.getBluetoothDevices({ // 获取蓝牙列表
                        success(re) {
                            callback(re)
                        },
                        fail(err) {
                            uni.showToast({
                                title: '获取设备失败',
                                duration: 2000,
                                icon: 'error'
                            });
                        }
                    });
                    _this.stopSearch();
                    uni.hideLoading();
                }, 5000);
            },
            fail(err) {
                uni.showToast({
                    title: '搜索失败',
                    duration: 2000,
                    icon: 'error'
                });
            }
        })
    },
    // 连接蓝牙设备
    connectDevice: (device_id) => {
        const _this = printInteraction;
        if (_this.device_id) {
            // 对刚才的连接设备进行断开
            _this.breakConnction();
        }
        if (device_id) {
            uni.showLoading({
                title: '正在连接'
            });
            uni.createBLEConnection({
                // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                deviceId:device_id,
                success(res) {
                    _this.device_id = device_id;
                    uni.showToast({
                        title: '连接成功',
                        duration: 2000,
                        icon: 'error'
                    });
                    // 安卓设备 需要等待1.5秒之后
                    _this.getDeviceService();
                },
                fail(err) {
                    uni.showToast({
                        title: `连接失败！${err.code}`,
                        duration: 2000,
                        icon: 'none'
                    });
                },
                complete() {
                    uni.hideLoading();
                }
            });
        } else {
            uni.showToast({
                title: '请选择蓝牙设备',
                duration: 2000,
                icon: 'error'
            });
        }
    },
    // 获取蓝牙设备所有服务
    getDeviceService: () => {
        const _this = printInteraction;
        uni.getBLEDeviceServices({
            deviceId: _this.device_id,
            success(res) {
                _this.services = res.services;
                res.services.some(item => {
                    if (item.isPrimary) {
                        _this.service_id = item.uuid;
                        return true;
                    }
                });
                _this.getDeviceCharacter();
            }
        })
    },
    // 获取连接设备服务的所有特征值
    getDeviceCharacter: () => {
        const _this = printInteraction;
        uni.getBLEDeviceCharacteristics({
            deviceId: _this.device_id,
            serviceId: _this.service_id,
            success(res) {
                let notify_id, write_id, read_id;
                res.characteristics.forEach(item => {
                    if (item.properties.notify) {
                        notify_id = item.uuid;
                    }
                    if (item.properties.write) {
                        write_id = item.uuid;
                    }
                    if (item.properties.read) {
                        read_id = item.uuid;
                    }
                });
                if (notify_id != null && write_id != null) {
                    _this.notify_id = notify_id;
                    _this.write_id = write_id;
                    _this.read_id = read_id;
                    if (_this.connFlag) { // 发送失败进来自动再次点击 | 或手动点击按钮重新打印
                        _this.printer(_this.stringData, _this.callback);
                    }
                }
            },
            fail(err) {
                // _this.getDeviceService(); // 再次获取服务uuid（可能导致死循环 需要进行判断）
                uni.showToast({
                    title: err.code || '没有找到特征值',
                    duration: 2000,
                    icon: 'error'
                });
            }
        })
    },
    // 字符串转为ArrayBuffer
    stringToArrayBuffer: (str) => {
        const len = str.length * 2; // 一个中文占 二个字节， 其它字母 占二个字节
        const buf = new ArrayBuffer(len);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            // console.log('1',str.charCodeAt(i)); // 对特殊字符不支持 如：表情emoji,麻将图案等
            // console.log('2',str.codePointAt(i)); // 对特殊字符可以支持
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    },
    // 开始打印
    printer: (stringData, callback) => {
        const _this = printInteraction;
        if (!_this.device_id) {
            uni.showToast({
                title: "请选择蓝牙设备",
                duration: 2000,
                icon: 'error'
            });
            return;
        }
        uni.showLoading({
            title: '正在打印'
        });
        _this.connFlag = true;
        _this.stringData = stringData;
        _this.callback = callback;
        let buffer = null;
        stringData.forEach(item => {
            _this._writeBLECharacteristicValue(_this.stringToArrayBuffer(item));
        });
    },
    _writeBLECharacteristicValue: (buffer) => {
        const _this = printInteraction;
        // 字节长度小于等于20 只调用一次
        if (buffer.byteLength <= 20) {
            uni.writeBLECharacteristicValue({
                deviceId: _this.device_id,
                serviceId: _this.service_id,
                characteristicId: _this.notify_id,
                value: buffer,
                writeType: "write", //iOS 优先 write，安卓优先 writeNoResponse
                success(res) {
                    _this.connFlag = false;
                    _this.callback();
                },
                fail(err) {
                    // 换一个uuid获取特征值重新写入 （或者 手动去点击打印，可能需要连续点击多次）
                    if (_this.services.length) {
                        _this.services.splice(0, 1);
                        _this.services.some(item => {
                            if (item.isPrimary) {
                                _this.service_id = item.uuid;
                                return true;
                            }
                        });
                        _this.getDeviceCharacter();
                    }
                },
                complete() {
                    uni.hideLoading();
                }
            })
        } else {
            // 进行分包 最大20字节长度
            const newBuffer = buffer.slice(20);
            const writeBuffer = buffer.slice(0, 20);
            uni.writeBLECharacteristicValue({
                deviceId: _this.device_id,
                serviceId: _this.service_id,
                characteristicId: _this.notify_id,
                value: writeBuffer,
                writeType: "write", //iOS 优先 write，安卓优先 writeNoResponse
                success(res) {
                    // console.log('递归发送成功 继续发送');
                    _this._writeBLECharacteristicValue(newBuffer);
                },
                fail(err) {
                    // console.log('递归发送失败', err.code);
                    // 一旦发生失败，就要重新发送一遍，（另有需求断点发送 可保存newBuffer变量）
                    uni.hideLoading();
                    if (_this.services.length) {
                        _this.services.splice(0, 1);
                        _this.services.some(item => {
                            if (item.isPrimary) {
                                _this.service_id = item.uuid;
                                return true;
                            }
                        });
                        _this.getDeviceCharacter();
                    }
                }
            })
        }
    },
    // 停止搜索
    stopSearch: () => {
        uni.stopBluetoothDevicesDiscovery({
            success(res) {}
        })
    },
    // 关闭蓝牙适配器
    closeBluetoothAdapter: () => {
        uni.closeBluetoothAdapter({
            success(res) {
                console.log('关闭蓝牙适配器')
            }
        })
    },
    // 断开连接
    breakConnction: () => {
        const _this = printInteraction;
        if (_this.device_id) {
            uni.closeBLEConnection({
                deviceId: _this.device_id,
                success() {
                    _this.connFlag = false;
                }
            });
        }
    },
}

export default printInteraction;