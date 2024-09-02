
//  验证访问码是否有效
function verifyAccessCode() {
  document.documentElement.setAttribute("hidden", true);
  let timer = null;
  const interval = 1000 * 60 * 60; // 每隔1小时刷新一次页面
  const setInvisible = () => {
    // 验证码过期，设置不可见 可自己拓展功能
    document.body.innerHTML = ``;
    alert("访问码已过期，请重新设置访问码。");
  };

  function formatDate(date, format) {
    const map = {
      MM: date.getMonth() + 1,
      dd: date.getDate(),
      yyyy: date.getFullYear(),
      HH: date.getHours(),
      mm: date.getMinutes(),
      ss: date.getSeconds(),
    };

    return format.replace(/MM|dd|yyyy|HH|mm|ss/gi, (matched) => {
      return map[matched].toString().padStart(2, "0");
    });
  }

  // 项目过期时间提示
  const showExpireTime = (payload) => {
    const expireTime = new Date(payload.expire);

    const showToUI = () => {
      const showInnerHTML = `
          <div class="expire-tip" id="expire-tip">
              <div>开发预览版</div>
              <div>至${formatDate(expireTime, "yyyy年MM月dd日")}</div>
              <style>
                .expire-tip {
                  position: fixed;
                  top: 0.6vh;
                  right: 14vw;
                  font-size: 1.8vh;
                  z-index: 9999;
                  color: rgb(202, 134, 120);
                  border-radius: 5px;
                  user-select: none;
                  pointer-events: none;
                  opacity: 0.8;
                }
              </style>
          </div>
        `;
      document.body.insertAdjacentHTML("beforeend", showInnerHTML);
      setTimeout(() => {
        // 此方法是防止用户通过 开发者工具 修改样式/或直接删除 祛除水印
        const observer = new MutationObserver(() => {
          // debugger
          const wmInstance = document.querySelector(`#expire-tip`); // 获取到你的水印dom
          if (!wmInstance) {
            console.log("水印被删除了！！！");
            document.body.insertAdjacentHTML("beforeend", showInnerHTML);
            return;
          }
        });
        observer.observe(document.body, {
          childList: true, // 观察目标子节点的变化，是否有添加或者删除
          attributes: false, // 观察属性变动
          subtree: false, // 观察后代节点，默认为 false
        });
      }, 1000);
    };

    const showConsole = () => {
      console.log(
        `%c K T \n项目名称：${payload.name} \n过期时间：${new Date(
          payload.expire
        ).toLocaleString()} `,
        `background-color: fuchsia ; color: white ; font-weight: bold ; 
                font-size: 20px ; font-style: italic ; text-decoration: underline; 
                font-family: 'american typewriter' ; text-shadow: 1px 1px 3px black; `
      );
    };
    showConsole();
    showToUI();
  };

  // 定时检查访问码
  const checkAccessCode = async () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      checkAccessCode();
    }, interval); // 每隔1小时检查一次
    if (!window.access_code) {
      return alert("请设置window.access_code 访问码"); // 没有设置访问码
    }
    try {
      const aesUtil = await AesUtil.getAesUtil();
      const decrypted = await aesUtil.decrypt(window.access_code);
      const payload = JSON.parse(decrypted);
      if (!payload.expire || payload.expire < Date.now())
        throw new Error("Access code expired."); // 访问码过期
      showExpireTime(payload);
      window.access_info = payload;
      document.documentElement.removeAttribute("hidden");
    } catch (e) {
      setInvisible();
      document.documentElement.removeAttribute("hidden");
    }
  };
  window.addEventListener("DOMContentLoaded", checkAccessCode);
}
export default verifyAccessCode;
