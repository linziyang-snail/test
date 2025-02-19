(function () {
    const ACCELERATION_THRESHOLD = 12;
    let stepCount = 0;
    let isMoving = false;

    const stepDisplay = document.getElementById("stepCount");
    const resetBtn = document.getElementById("resetBtn");
    const requestBtn = document.getElementById("requestMotionBtn");

    // 重置步數按鈕
    resetBtn.addEventListener("click", () => {
        stepCount = 0;
        stepDisplay.textContent = stepCount;
    });

    // 點擊「允許動態權限」按鈕
    requestBtn.addEventListener("click", async function () {
        // 檢查是否存在 requestPermission，iOS Safari 13+ 需要
        if (typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function"
        ) {
            try {
                // 請求使用者允許
                const response = await DeviceMotionEvent.requestPermission();
                if (response === "granted") {
                    // 若允許，就開始監聽 devicemotion
                    startPedometer();
                } else {
                    alert("使用者未允許 motion 權限，無法啟動計步器。");
                }
            } catch (err) {
                console.error(err);
                alert("請求 motion 權限發生錯誤: " + err);
            }
        } else {
            // Android Chrome 或其他不需要 requestPermission 的情況
            // 直接啟動計步器
            startPedometer();
        }
    });

    function startPedometer() {
        if (window.DeviceMotionEvent) {
            window.addEventListener("devicemotion", handleMotion, true);
            console.log("已開始偵測 devicemotion 事件，請走動或搖晃裝置測試。");
        } else {
            alert("此裝置或瀏覽器不支援 devicemotion。");
        }
    }

    function handleMotion(event) {
        let acc = event.acceleration;
        // 部分瀏覽器可能使用 event.accelerationIncludingGravity
        if (!acc) {
            acc = event.accelerationIncludingGravity;
            if (!acc) return;
        }
        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;

        // 合成加速度
        const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

        if (totalAcceleration > ACCELERATION_THRESHOLD && !isMoving) {
            stepCount++;
            stepDisplay.textContent = stepCount;
            isMoving = true;
            setTimeout(() => {
                isMoving = false;
            }, 300);
        }
    }
})();