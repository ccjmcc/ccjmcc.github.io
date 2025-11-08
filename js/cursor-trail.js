/*
 * 鼠标拖尾效果
 * 在鼠标移动时创建平滑的拖尾轨迹
 */
(function() {
    // 配置参数
    var config = {
        particleCount: 20,        // 粒子数量（拖尾长度）
        particleSize: 4,          // 粒子大小
        speed: 0.1,               // 跟随速度（0-1）
        fadeSpeed: 0.05,          // 淡出速度
        color: '255, 255, 255',   // 拖尾颜色（RGB格式，便于调整透明度）
        maxOpacity: 0.8           // 最大透明度
    };

    var canvas, ctx;
    var particles = [];
    var mouseX = 0, mouseY = 0;
    var isInitialized = false;

    // 初始化 Canvas
    function initCanvas() {
        canvas = document.createElement('canvas');
        canvas.id = 'cursor-trail';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';  // 不阻挡鼠标事件
        canvas.style.zIndex = '9999';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext('2d');
        document.body.appendChild(canvas);
        isInitialized = true;

        // 监听窗口大小变化
        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // 粒子类
    function Particle(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.opacity = config.maxOpacity;
        this.size = config.particleSize;
    }

    Particle.prototype.update = function() {
        // 平滑移动到目标位置
        this.x += (this.targetX - this.x) * config.speed;
        this.y += (this.targetY - this.y) * config.speed;
        
        // 逐渐淡出
        this.opacity -= config.fadeSpeed;
        if (this.opacity < 0) {
            this.opacity = 0;
        }
    };

    Particle.prototype.draw = function() {
        if (this.opacity <= 0) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + config.color + ', ' + this.opacity + ')';
        ctx.fill();
    };

    // 初始化粒子
    function initParticles() {
        particles = [];
        for (var i = 0; i < config.particleCount; i++) {
            particles.push(new Particle(mouseX, mouseY));
        }
    }

    // 更新粒子位置
    function updateParticles() {
        // 更新目标位置（鼠标位置）
        particles[0].targetX = mouseX;
        particles[0].targetY = mouseY;

        // 每个粒子跟随前一个粒子
        for (var i = 1; i < particles.length; i++) {
            particles[i].targetX = particles[i - 1].x;
            particles[i].targetY = particles[i - 1].y;
        }
    }

    // 动画循环
    function animate() {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 更新并绘制粒子
        updateParticles();
        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        requestAnimationFrame(animate);
    }

    // 鼠标移动事件
    function onMouseMove(e) {
        if (!isInitialized) {
            initCanvas();
            initParticles();
            animate();
        }
        
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    // 鼠标离开窗口时隐藏拖尾
    function onMouseLeave() {
        mouseX = -100;
        mouseY = -100;
    }

    // 启动拖尾效果（等待 DOM 加载完成）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseleave', onMouseLeave);
        });
    } else {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseleave', onMouseLeave);
    }
})();

