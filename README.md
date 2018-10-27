## 使用Service Worker提升Web应用体验
    Service Worker能做的事情很多，通过在其生命周期内自定义响应过程可以做到：
    1.资源缓存控制
    2.实现离线页面
    3.版本更迭
    ...
    要注意的几点是：
    1.出于安全原因，Service Worker只能在HTTPS下运行。
    2.需要确保Service Worker自身的即时更新。

    最重要的一点是：你需要在熟悉Service Worker生命周期的前提下定义你的Service Worker行为
关于Service Worker生命周期，可以查看mdn上的相关内容：[Service Worker API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
