const { test, expect } = require('@playwright/test');

/**
 * Dashboard E2E 测试
 * 核心路径：首页仪表盘 → 积分概览 → 任务统计 → 成就展示
 */
test.describe('Dashboard 模块', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token-mock');
      localStorage.setItem('userId', 'test-user-001');
    });
  });

  test('Dashboard 加载正常', async ({ page }) => {
    await page.goto('/');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 验证关键元素
    await expect(page.locator('text=仪表盘, text=首页, text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('积分展示模块', async ({ page }) => {
    await page.goto('/');
    
    // 等待积分模块加载
    await page.waitForSelector('[class*="points"], [class*="score"], [class*="credit"]', { timeout: 5000 }).catch(() => {});
    
    // 验证积分数字可见
    const pointsEl = page.locator('[class*="points"] span, [class*="score"] span, [class*="credit"] span').first();
    await expect(pointsEl).toBeVisible();
    
    // 验证积分标签
    await expect(page.locator('text=积分, text=总积分')).toBeVisible();
  });

  test('任务完成率展示', async ({ page }) => {
    await page.goto('/');
    
    // 等待图表加载
    await page.waitForSelector('canvas, [class*="chart"], [class*="echarts"]', { timeout: 5000 }).catch(() => {});
    
    // 验证任务相关文字
    await expect(page.locator('text=任务, text=完成率').first()).toBeVisible();
  });

  test('儿童积分排行榜', async ({ page }) => {
    await page.goto('/');
    
    // 查找排行榜
    const rankList = page.locator('[class*="rank"], [class*="leaderboard"]').first();
    await expect(rankList).toBeVisible({ timeout: 5000 });
    
    // 验证至少有排名数据
    await expect(page.locator('text=第1名, text=第2名, text=1st, text=2nd').first()).toBeVisible({ timeout: 5000 });
  });

  test('最近任务列表', async ({ page }) => {
    await page.goto('/');
    
    // 滚动到最近任务区域
    const recentTasks = page.locator('text=最近任务, text=最新任务').first();
    await expect(recentTasks).toBeVisible({ timeout: 5000 });
    
    // 验证任务列表项
    const taskItems = page.locator('.task-item, [class*="task"]');
    const count = await taskItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Console 错误捕获', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', err => {
      errors.push(err.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 过滤已知的无关错误
    const realErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('net::ERR')
    );
    
    expect(realErrors).toHaveLength(0);
  });

  test('页面响应式布局', async ({ page }) => {
    await page.goto('/');
    
    // 测试不同视口
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(500);
    
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await page.waitForTimeout(500);
    
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.waitForTimeout(500);
    
    // 验证页面内容始终可见
    await expect(page.locator('body')).toBeVisible();
  });
});
