(function () {
    // 簡易加速度門檻，實務上需要更複雜的濾波或演算法
    const ACCELERATION_THRESHOLD = 12;
    // 計步器狀態
    let stepCount = 0;
    let isMoving = false; // 用來避免「一次加速度造成多次加計」

    const stepDisplay = document.getElementById("stepCount");
    const resetBtn = document.getElementById("resetBtn");

    // 點擊按鈕 => 歸零
    resetBtn.addEventListener("click", () => {
        stepCount = 0;
        stepDisplay.textContent = stepCount;
    });

    // 檢查瀏覽器是否支援 devicemotion
    if (window.DeviceMotionEvent) {
        window.addEventListener("devicemotion", handleMotion, true);
        console.log("devicemotion事件已監聽，請在手機上測試。");
    } else {
        alert("此裝置或瀏覽器不支援 devicemotion。");
    }

    function handleMotion(event) {
        // 取得加速度 (去除重力影響後)
        let acc = event.acceleration;
        if (!acc) {
            // 某些瀏覽器可能將加速度放在 event.accelerationIncludingGravity
            // 或裝置不支援此API
            return;
        }
        // x, y, z 三軸的加速度
        let x = acc.x || 0;
        let y = acc.y || 0;
        let z = acc.z || 0;

        // 簡單計算合成加速度 (向量長度)
        let totalAcceleration = Math.sqrt(x * x + y * y + z * z);

        // 如果超過閾值 -> 可能是一個「步伐」
        if (totalAcceleration > ACCELERATION_THRESHOLD && !isMoving) {
            stepCount++;
            stepDisplay.textContent = stepCount;
            isMoving = true;
            // 一段時間後解鎖，避免一次振動計算多步
            setTimeout(() => {
                isMoving = false;
            }, 300);
        }
    }
})();