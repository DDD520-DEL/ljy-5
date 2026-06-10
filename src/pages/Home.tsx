import { Link } from 'react-router-dom'
import { BookOpen, Users, QrCode, Heart, MapPin, Clock, Coffee, Sparkles, ChevronRight, BookMarked, Star } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: QrCode,
      title: '图书溯源',
      description: '每一本书都有独一无二的溯源档案，记录它的旅程故事',
      color: 'from-coffee-500 to-coffee-700',
    },
    {
      icon: BookMarked,
      title: '前任读者短评',
      description: '穿越时空与读过这本书的人对话，感受文字的温度',
      color: 'from-brass-400 to-brass-600',
    },
    {
      icon: Users,
      title: '线下读书会',
      description: '和志同道合的朋友围坐一起，分享阅读的喜悦与感动',
      color: 'from-forest-500 to-forest-600',
    },
    {
      icon: Heart,
      title: '独立书店精神',
      description: '我们相信每一本书都有灵魂，每一位读者都值得被尊重',
      color: 'from-rose-500 to-rose-700',
    },
  ]

  return (
    <div className="min-h-screen">
      <section className="relative py-20 px-4 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coffee-50 via-amber-50/50 to-coffee-100" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brass-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-forest-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative container max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-coffee-200 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-brass-500" />
            <span className="text-sm text-coffee-700">欢迎来到墨香书坊</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-coffee-900 mb-6 leading-tight">
            让每一本书
            <br />
            <span className="bg-gradient-to-r from-coffee-700 via-brass-500 to-coffee-700 bg-clip-text text-transparent">
              都有故事
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-coffee-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            一家有温度的独立书店。我们相信，书籍不仅仅是纸张与油墨的组合，
            更是一段段流转的记忆。扫码溯源，遇见这本书的前世今生。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-coffee-700 text-white rounded-xl font-medium hover:bg-coffee-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <BookOpen className="w-5 h-5" />
              浏览馆藏
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/meetups"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-coffee-700 border border-coffee-300 rounded-xl font-medium hover:bg-coffee-50 transition-all duration-300 hover:shadow-md"
            >
              <Users className="w-5 h-5" />
              参加读书会
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { label: '馆藏图书', value: '5000+' },
              { label: '读书会', value: '200+' },
              { label: '注册会员', value: '1200+' },
              { label: '成立年份', value: '2015' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4">
                <p className="text-3xl md:text-4xl font-serif font-bold text-coffee-800">{stat.value}</p>
                <p className="text-sm text-coffee-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-coffee-900 mb-4">
              我们的特色
            </h2>
            <p className="text-coffee-600 max-w-xl mx-auto">
              墨香书坊不仅仅是一家书店，更是一个有温度的文化空间
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="group relative p-8 bg-white rounded-2xl border border-coffee-100 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 shadow-lg`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-coffee-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-coffee-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute top-6 right-6 text-5xl font-serif font-bold text-coffee-50 opacity-30 group-hover:opacity-50 transition-opacity">
                  0{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 px-4 bg-gradient-to-b from-white to-coffee-50">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coffee-100 text-coffee-700 text-sm mb-6">
                <BookOpen className="w-4 h-4" />
                关于我们
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-coffee-900 mb-6 leading-tight">
                一家藏在巷子里的
                <br />
                <span className="text-brass-500">十年独立书店</span>
              </h2>
              <div className="space-y-4 text-coffee-600 leading-relaxed">
                <p>
                  墨香书坊成立于2015年，坐落在城市最有烟火气的老巷子里。
                  我们相信，阅读是一场穿越时空的对话，而每一本流转的书，
                  都承载着无数读者的情感与记忆。
                </p>
                <p>
                  在这里，你可以找到刚出版的新书，也可以偶遇带着前任读者
                  批注与温度的旧书。我们记录每本书的来源与流转，让你知道
                  你正在读的这本书，曾经被谁爱过。
                </p>
                <p>
                  每周我们都会举办线下读书会，和志同道合的朋友围坐在一起，
                  就着咖啡与茶香，聊书、聊生活、聊我们所处的这个时代。
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-coffee-600">
                  <MapPin className="w-4 h-4 text-brass-500" />
                  <span className="text-sm">文化路12号巷内50米</span>
                </div>
                <div className="flex items-center gap-2 text-coffee-600">
                  <Clock className="w-4 h-4 text-brass-500" />
                  <span className="text-sm">每日 10:00 - 21:00</span>
                </div>
                <div className="flex items-center gap-2 text-coffee-600">
                  <Coffee className="w-4 h-4 text-brass-500" />
                  <span className="text-sm">提供手冲咖啡与茶饮</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20independent%20bookstore%20interior%20warm%20lighting%20wooden%20shelves%20people%20reading%20comfortable%20armchairs%20plants%20vintage%20style&image_size=portrait_4_3"
                  alt="墨香书坊内景"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-coffee-100 max-w-[200px]">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-brass-400 text-brass-400" />
                  ))}
                </div>
                <p className="text-sm text-coffee-800 font-medium">
                  "城市里最温暖的角落"
                </p>
                <p className="text-xs text-coffee-500 mt-1">— 读者留言</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 bg-coffee-800">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
            准备好开始你的阅读之旅了吗？
          </h2>
          <p className="text-coffee-200 mb-8 max-w-xl mx-auto">
            走进墨香书坊，翻开一本书，遇见一段跨越时空的对话。
            也许下一个留下故事的人，就是你。
          </p>
          <Link
            to="/books/new"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brass-500 text-white rounded-xl font-medium hover:bg-brass-600 transition-all duration-300 hover:shadow-lg"
          >
            <BookOpen className="w-5 h-5" />
            捐赠你的旧书
          </Link>
        </div>
      </section>
      
      <footer className="py-8 px-4 bg-coffee-900">
        <div className="container max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-brass-400" />
            <span className="font-serif font-bold text-white">墨香书坊</span>
          </div>
          <p className="text-coffee-300 text-sm">
            © 2026 墨香书坊 · 让每一本书都有故事
          </p>
        </div>
      </footer>
    </div>
  )
}
