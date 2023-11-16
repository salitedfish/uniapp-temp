// 根据模版和数据，生成渲染模版
export const genTemplate = (content: {template: string, checkList: string[]}, obj: any) => {
      const { template = "", checkList = [] } = content;
      let html = document.createElement("div");
      html.innerHTML = template;
      checkList.forEach((item) => {
        if (item !== "shortUrl") {
          if (item.indexOf("c-") === 0) return; // 自定义字段排除

          const node = html.querySelector(
            `.template-${item} .content-container p`
          );
          if (node) node.innerText = obj[item] || "-";
        } else {
          const node = html.querySelector(
            `.template-${item} .content-container img`
          );
          if (node) {
            QRCode.toDataURL(
              obj[item],
              { margin: 0, color: { dark: "#000", light: "#ffffff" } },
              function (err, url) {
                node.src = url;
              }
            );
          }
        }
      });
      const htmlStr = html.innerHTML;
      html = null;
      return htmlStr;
    }