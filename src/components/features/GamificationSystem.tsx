import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award,
  TrendingUp,
  Crown,
  Medal,
  Flame,
  Lock,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

export function GamificationSystem() {
  const userLevel = {
    current: 12,
    xp: 2450,
    xpToNext: 3000,
    title: 'Physics Champion',
    rank: 'Gold'
  };

  const achievements = [
    {
      id: 1,
      title: '7-Day Streak',
      description: 'Study for 7 consecutive days',
      icon: Flame,
      unlocked: true,
      progress: 100,
      color: 'orange',
      xp: 500,
      date: 'Unlocked 2 days ago'
    },
    {
      id: 2,
      title: 'Physics Master',
      description: 'Score 90%+ in 5 Physics tests',
      icon: Trophy,
      unlocked: true,
      progress: 100,
      color: 'blue',
      xp: 750,
      date: 'Unlocked yesterday'
    },
    {
      id: 3,
      title: 'Speed Demon',
      description: 'Complete 50 questions in 30 minutes',
      icon: Zap,
      unlocked: false,
      progress: 68,
      color: 'yellow',
      xp: 600,
      date: null
    },
    {
      id: 4,
      title: 'Perfect Score',
      description: 'Score 100% in any test',
      icon: Star,
      unlocked: false,
      progress: 0,
      color: 'purple',
      xp: 1000,
      date: null
    },
    {
      id: 5,
      title: 'Early Bird',
      description: 'Study before 7 AM for 5 days',
      icon: Award,
      unlocked: false,
      progress: 40,
      color: 'green',
      xp: 400,
      date: null
    },
    {
      id: 6,
      title: 'Practice Hero',
      description: 'Solve 1000 practice questions',
      icon: Target,
      unlocked: false,
      progress: 73,
      color: 'red',
      xp: 800,
      date: null
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'Aarav Patel', xp: 4250, avatar: 'AP', streak: 21, change: 0 },
    { rank: 2, name: 'Priya Sharma', xp: 3890, avatar: 'PS', streak: 18, change: 1 },
    { rank: 3, name: 'Rohan Sharma', xp: 2450, avatar: 'RS', streak: 7, change: -1, isYou: true },
    { rank: 4, name: 'Ananya Desai', xp: 2340, avatar: 'AD', streak: 14, change: 2 },
    { rank: 5, name: 'Kabir Singh', xp: 2100, avatar: 'KS', streak: 10, change: -1 }
  ];

  const dailyChallenges = [
    {
      id: 1,
      title: 'Complete 20 MCQs',
      progress: 15,
      total: 20,
      xp: 100,
      timeLeft: '2h 30m',
      completed: false
    },
    {
      id: 2,
      title: 'Watch 2 Video Lessons',
      progress: 1,
      total: 2,
      xp: 80,
      timeLeft: '2h 30m',
      completed: false
    },
    {
      id: 3,
      title: 'Study for 45 minutes',
      progress: 45,
      total: 45,
      xp: 120,
      timeLeft: 'Completed',
      completed: true
    }
  ];

  const rewards = [
    { name: 'Premium Notes', cost: 500, icon: '📚', unlocked: true },
    { name: 'Custom Avatar', cost: 300, icon: '🎨', unlocked: true },
    { name: 'Doubt Priority', cost: 1000, icon: '⚡', unlocked: false },
    { name: 'Study Buddy AI', cost: 2000, icon: '🤖', unlocked: false }
  ];

  const progressPercentage = (userLevel.xp / userLevel.xpToNext) * 100;

  return (
    <div className="space-y-5">
      {/* Level & Progress */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl">Level {userLevel.current}</h2>
                  <p className="text-sm text-purple-100">{userLevel.title}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 inline-block mb-2">
                <span className="text-lg">{userLevel.rank} Rank</span>
              </div>
              <p className="text-sm text-purple-100">Top 15% Nationwide</p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress to Level {userLevel.current + 1}</span>
              <span>{userLevel.xp} / {userLevel.xpToNext} XP</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-purple-100">
            {userLevel.xpToNext - userLevel.xp} XP needed to level up!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Achievements */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Achievements
            </h3>
            <span className="text-xs text-gray-500">
              {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked 
                      ? `border-${achievement.color}-500 bg-${achievement.color}-50` 
                      : 'border-gray-200 bg-gray-50 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      achievement.unlocked 
                        ? `bg-${achievement.color}-100` 
                        : 'bg-gray-200'
                    }`}>
                      {achievement.unlocked ? (
                        <Icon className={`w-6 h-6 text-${achievement.color}-600`} />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm text-gray-900 mb-1">{achievement.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                      
                      {achievement.unlocked ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 bg-${achievement.color}-100 text-${achievement.color}-700 rounded-full`}>
                            +{achievement.xp} XP
                          </span>
                          <span className="text-xs text-gray-500">{achievement.date}</span>
                        </div>
                      ) : (
                        <div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{achievement.progress}% Complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Daily Challenges */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Daily Challenges
              </h3>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                +300 XP
              </span>
            </div>

            <div className="space-y-3">
              {dailyChallenges.map((challenge) => (
                <div 
                  key={challenge.id}
                  className={`p-3 rounded-lg border ${
                    challenge.completed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-900">{challenge.title}</span>
                    {challenge.completed && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full ${
                        challenge.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{challenge.progress}/{challenge.total}</span>
                    <span className={challenge.completed ? 'text-green-600' : 'text-gray-500'}>
                      {challenge.timeLeft}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Leaderboard
              </h3>
              <button className="text-xs text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>

            <div className="space-y-2">
              {leaderboard.map((user) => (
                <div 
                  key={user.rank}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    user.isYou 
                      ? 'bg-blue-50 border-2 border-blue-300' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    user.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                    user.rank === 2 ? 'bg-gray-300 text-gray-700' :
                    user.rank === 3 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {user.rank <= 3 ? <Medal className="w-4 h-4" /> : `#${user.rank}`}
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-900">
                      {user.name}
                      {user.isYou && <span className="text-blue-600 ml-1">(You)</span>}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{user.xp} XP</span>
                      <span className="text-xs text-orange-600 flex items-center gap-0.5">
                        <Flame className="w-3 h-3" />
                        {user.streak}
                      </span>
                    </div>
                  </div>
                  {user.change !== 0 && (
                    <span className={`text-xs ${user.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {user.change > 0 ? '↑' : '↓'} {Math.abs(user.change)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rewards Shop */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-5">
            <h3 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Rewards Shop
            </h3>
            <div className="space-y-2">
              {rewards.map((reward, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-3 bg-white rounded-lg border ${
                    reward.unlocked ? 'border-green-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{reward.icon}</span>
                    <span className="text-xs text-gray-700">{reward.name}</span>
                  </div>
                  {reward.unlocked ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="text-xs text-blue-600">{reward.cost} XP</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
