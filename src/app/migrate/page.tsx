'use client';

import { useState } from 'react';
import { Database, Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MigratePage() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 读取 localStorage 数据
  const getLocalStorageData = () => {
    if (typeof window === 'undefined') return null;

    const teams = JSON.parse(localStorage.getItem('football_teams') || '[]');
    const players = JSON.parse(localStorage.getItem('football_players') || '[]');
    const matches = JSON.parse(localStorage.getItem('football_matches') || '[]');

    return { teams, players, matches };
  };

  // 执行迁移
  const handleMigrate = async () => {
    setIsMigrating(true);
    setError(null);
    setMigrationResults(null);

    try {
      const localData = getLocalStorageData();

      if (!localData) {
        throw new Error('无法读取本地数据');
      }

      const totalItems = localData.teams.length + localData.players.length + localData.matches.length;

      if (totalItems === 0) {
        throw new Error('没有数据需要迁移');
      }

      // 调用迁移 API
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '迁移失败');
      }

      setMigrationResults(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsMigrating(false);
    }
  };

  const localData = typeof window !== 'undefined' ? getLocalStorageData() : null;
  const totalItems =
    localData?.teams.length +
    localData?.players.length +
    localData?.matches.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Database className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            数据迁移工具
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            将 localStorage 中的数据迁移到 PostgreSQL 数据库
          </p>
        </div>

        {/* 当前数据状态 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>当前本地数据</CardTitle>
          </CardHeader>
          <CardContent>
            {localData ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">球队数量：</span>
                  <span className="font-medium">{localData.teams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">球员数量：</span>
                  <span className="font-medium">{localData.players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">比赛数量：</span>
                  <span className="font-medium">{localData.matches.length}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold">总计：</span>
                  <span className="font-semibold text-red-600">{totalItems} 条数据</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">正在加载数据...</p>
            )}
          </CardContent>
        </Card>

        {/* 提示信息 */}
        <Card className="mb-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">迁移前请注意：</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>迁移过程不可中断，请确保网络连接稳定</li>
                  <li>迁移后数据将存储在数据库中，不再依赖浏览器缓存</li>
                  <li>建议先导出数据备份，以防万一</li>
                  <li>迁移成功后，可以保留 localStorage 数据作为备份</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 迁移按钮 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Button
              onClick={handleMigrate}
              disabled={isMigrating || totalItems === 0}
              className="w-full bg-red-700 hover:bg-red-800 text-white h-12 text-lg"
            >
              {isMigrating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  正在迁移中...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  开始迁移
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 迁移结果 */}
        {migrationResults && (
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                迁移完成
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 摘要 */}
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      成功：
                    </span>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {migrationResults.summary.totalSuccess}
                    </span>
                  </div>
                  {migrationResults.summary.totalFailed > 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold text-red-700 dark:text-red-400">
                        失败：
                      </span>
                      <span className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {migrationResults.summary.totalFailed}
                      </span>
                    </div>
                  )}
                </div>

                {/* 详细结果 */}
                <div className="space-y-3">
                  {/* Teams */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>球队数据：</span>
                      <span>
                        <span className="text-green-600">{migrationResults.results.teams.success}</span>
                        {migrationResults.results.teams.failed > 0 && (
                          <span className="text-red-600 ml-2">
                            失败 {migrationResults.results.teams.failed}
                          </span>
                        )}
                      </span>
                    </div>
                    {migrationResults.results.teams.errors.length > 0 && (
                      <div className="text-xs text-red-600 ml-4">
                        {migrationResults.results.teams.errors.map((error: string, i: number) => (
                          <div key={i}>{error}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Players */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>球员数据：</span>
                      <span>
                        <span className="text-green-600">{migrationResults.results.players.success}</span>
                        {migrationResults.results.players.failed > 0 && (
                          <span className="text-red-600 ml-2">
                            失败 {migrationResults.results.players.failed}
                          </span>
                        )}
                      </span>
                    </div>
                    {migrationResults.results.players.errors.length > 0 && (
                      <div className="text-xs text-red-600 ml-4">
                        {migrationResults.results.players.errors.map((error: string, i: number) => (
                          <div key={i}>{error}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Matches */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>比赛数据：</span>
                      <span>
                        <span className="text-green-600">{migrationResults.results.matches.success}</span>
                        {migrationResults.results.matches.failed > 0 && (
                          <span className="text-red-600 ml-2">
                            失败 {migrationResults.results.matches.failed}
                          </span>
                        )}
                      </span>
                    </div>
                    {migrationResults.results.matches.errors.length > 0 && (
                      <div className="text-xs text-red-600 ml-4">
                        {migrationResults.results.matches.errors.map((error: string, i: number) => (
                          <div key={i}>{error}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Match Stats */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>比赛统计：</span>
                      <span>
                        <span className="text-green-600">{migrationResults.results.matchStats.success}</span>
                        {migrationResults.results.matchStats.failed > 0 && (
                          <span className="text-red-600 ml-2">
                            失败 {migrationResults.results.matchStats.failed}
                          </span>
                        )}
                      </span>
                    </div>
                    {migrationResults.results.matchStats.errors.length > 0 && (
                      <div className="text-xs text-red-600 ml-4">
                        {migrationResults.results.matchStats.errors.map((error: string, i: number) => (
                          <div key={i}>{error}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 下一步操作 */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    迁移完成后，您可以：
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/players'}
                    >
                      前往球员管理
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/matches'}
                    >
                      前往比赛记录
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/stats'}
                    >
                      前往统计数据
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 错误提示 */}
        {error && (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex gap-3 text-red-600 dark:text-red-400">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">迁移失败</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
