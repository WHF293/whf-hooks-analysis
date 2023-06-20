# useNetwork

> 管理网络连接状态的 Hook

- [useNetwork 文档](https://ahooks.js.org/zh-CN/hooks/use-network)

## 武功秘籍

导入和类型声明

```ts
import { useEffect, useState } from "react";
import { isObject } from "../utils";

export interface NetworkState {
	since?: Date;
	online?: boolean;
	rtt?: number;
	type?: string;
	downlink?: number;
	saveData?: boolean;
	downlinkMax?: number;
	effectiveType?: string;
}

enum NetworkEventType {
	ONLINE = "online",
	OFFLINE = "offline",
	CHANGE = "change",
}
```

### getConnection

```ts
// 获取网络连接
function getConnection() {
	const nav = navigator as any;
	if (!isObject(nav)) return null;
	// 兼容不同浏览器
	return nav.connection || nav.mozConnection || nav.webkitConnection;
}
```

### getConnectionProperty

```ts
// 获取网络链接信息
function getConnectionProperty(): NetworkState {
	const c = getConnection();
	if (!c) return {};

	// https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
	return {
		// 返回了当前连接下评估的往返时延（RTT, round-trip time）
		rtt: c.rtt,
		// 设备用于与网络通信的连接类型, ajax / jsonp / websocket
		type: c.type,
		// 返回用户已在用户代理上设置了减少数据使用量选项
		saveData: c.saveData,
		// 返回以 Mb/s 为单位的有效带宽，并保留该值为 25kb/s 的最接近的整数倍。
		downlink: c.downlink,
		// 返回最大下行链路速度（以兆比特每秒 （Mbps） 为单位）
		downlinkMax: c.downlinkMax,
		// 返回连接的网络类型 “慢速 2g”、“2g”、“3g”或“4g”之一
		effectiveType: c.effectiveType,
	};
}
```

### useNetwork

```ts{35-41,45-47}
function useNetwork(): NetworkState {
	const [state, setState] = useState(() => {
		return {
			since: undefined, // 最后改变时间
			online: navigator?.onLine, // 是否有网络
			...getConnectionProperty(),
		};
	});

	useEffect(() => {
		// 网络连接
		const onOnline = () => {
			setState((prevState) => ({
				...prevState,
				online: true,
				since: new Date(),
			}));
		};
		// 网络掉线
		const onOffline = () => {
			setState((prevState) => ({
				...prevState,
				online: false,
				since: new Date(),
			}));
		};
		// 网络状态发生改变
		const onConnectionChange = () => {
			setState((prevState) => ({
				...prevState,
				...getConnectionProperty(),
			}));
		};

		// 组件改在，开启网络连接、掉线监听
		window.addEventListener(NetworkEventType.ONLINE, onOnline);
		window.addEventListener(NetworkEventType.OFFLINE, onOffline);

		// 获取网络信息 api，如果能拿到，开启网络状态变化的监听
		const connection = getConnection();
		connection?.addEventListener(NetworkEventType.CHANGE, onConnectionChange);

		return () => {
			// 组件卸载，移除上面的监听
			window.removeEventListener(NetworkEventType.ONLINE, onOnline);
			window.removeEventListener(NetworkEventType.OFFLINE, onOffline);
			connection?.removeEventListener(NetworkEventType.CHANGE, onConnectionChange);
		};
	}, []);

	return state;
}

export default useNetwork;
```
