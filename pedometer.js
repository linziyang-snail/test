(function () {
    // ====== 可自行調整參數 ======
    const ALPHA = 0.8;                // 高通濾波用 (0.8 ~ 0.9 常見)
    const ACC_THRESHOLD = 1.2;        // 震動閾值 (m/s^2) -> 實際可調
    const TIME_LOCK_MS = 300;         // 鎖定時間，避免同一次震動多次計步
    // ============================

    let stepCount = 0;    // 目前步數
    let isMoving = false; // 時間鎖: 每次檢測到一步後，鎖定一段時間不再計

    // 重力向量 (用低通取得重力，再 raw - gravity 為高通分量)
    let gravity = { x: 0, y: 0, z: 0 };

    // 取得 DOM
    const stepDisplay = document.getElementById("stepCount");
    const resetBtn = document.getElementById("resetBtn");
    const requestBtn = document.getElementById("requestBtn");

    // 點「重置」歸零
    resetBtn.addEventListener("click", () => {
        stepCount = 0;
        stepDisplay.textContent = stepCount;
    });

    // 點「允許動態權限」
    requestBtn.addEventListener("click", async () => {
        // iOS Safari
        if (typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function") {
            try {
                const resp = await DeviceMotionEvent.requestPermission();
                if (resp === "granted") {
                    startListenMotion();
                } else {
                    alert("使用者未允許 Motion 權限，無法啟動計步器。");
                }
            } catch (err) {
                alert("請求 motion 權限時發生錯誤: " + err);
            }
        } else {
            // 其他瀏覽器(不需要 requestPermission)
            startListenMotion();
        }
    });

    function startListenMotion() {
        if (window.DeviceMotionEvent) {
            window.addEventListener("devicemotion", onDeviceMotion, true);
            console.log("開始監聽 devicemotion。請走動或晃動測試。");
        } else {
            alert("此裝置或瀏覽器不支援 devicemotion。");
        }
    }

    function onDeviceMotion(e) {
        let acc = e.acceleration;
        // 某些裝置只有 accelerationIncludingGravity
        if (!acc) {
            acc = e.accelerationIncludingGravity;
            if (!acc) return;
        }
        let x = acc.x || 0;
        let y = acc.y || 0;
        let z = acc.z || 0;

        // === 高通濾波 ===
        // 1) 先對 x, y, z做低通，取得重力
        gravity.x = ALPHA * gravity.x + (1 - ALPHA) * x;
        gravity.y = ALPHA * gravity.y + (1 - ALPHA) * y;
        gravity.z = ALPHA * gravity.z + (1 - ALPHA) * z;

        // 2) 用 raw - gravity，得到動態分量(去除重力)
        let rx = x - gravity.x;
        let ry = y - gravity.y;
        let rz = z - gravity.z;

        // 計算三軸向量長度
        let mag = Math.sqrt(rx * rx + ry * ry + rz * rz);

        // 若大於閾值 => 可能是一步
        if (mag > ACC_THRESHOLD && !isMoving) {
            stepCount++;
            stepDisplay.textContent = stepCount;
            isMoving = true;
            // TIME_LOCK_MS 時間內不再計
            setTimeout(() => {
                isMoving = false;
            }, TIME_LOCK_MS);
        }
    }
})();