import React from "react";

const getCardColors = (color) => {
  const colors = {
    blue: {
      card: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30',
      title: 'text-blue-800 dark:text-blue-200',
      badge: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300',
      text1: 'text-blue-700 dark:text-blue-300',
      text2: 'text-blue-600 dark:text-blue-400'
    },
    emerald: {
      card: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
      title: 'text-emerald-800 dark:text-emerald-200',
      badge: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300',
      text1: 'text-emerald-700 dark:text-emerald-300',
      text2: 'text-emerald-600 dark:text-emerald-400'
    },
    purple: {
      card: 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30',
      title: 'text-purple-800 dark:text-purple-200',
      badge: 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300',
      text1: 'text-purple-700 dark:text-purple-300',
      text2: 'text-purple-600 dark:text-purple-400'
    },
    amber: {
      card: 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30',
      title: 'text-amber-800 dark:text-amber-200',
      badge: 'bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300',
      text1: 'text-amber-700 dark:text-amber-300',
      text2: 'text-amber-600 dark:text-amber-400'
    },
    indigo: {
      card: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
      title: 'text-indigo-800 dark:text-indigo-200',
      badge: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300',
      text1: 'text-indigo-700 dark:text-indigo-300',
      text2: 'text-indigo-600 dark:text-indigo-400'
    },
    slate: {
      card: 'bg-slate-50 dark:bg-slate-800 border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50',
      title: 'text-slate-700 dark:text-slate-300',
      badge: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
      text1: 'text-slate-600 dark:text-slate-400',
      text2: 'text-slate-500 dark:text-slate-500'
    },
    lime: {
      card: 'bg-lime-50 dark:bg-lime-900/20 border-lime-500 hover:bg-lime-100 dark:hover:bg-lime-900/30',
      title: 'text-lime-800 dark:text-lime-200',
      badge: 'bg-lime-100 dark:bg-lime-800 text-lime-700 dark:text-lime-300',
      text1: 'text-lime-700 dark:text-lime-300',
      text2: 'text-lime-600 dark:text-lime-400'
    },
    fuchsia: {
      card: 'bg-fuchsia-50 dark:bg-fuchsia-900/20 border-fuchsia-500 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/30',
      title: 'text-fuchsia-800 dark:text-fuchsia-200',
      badge: 'bg-fuchsia-100 dark:bg-fuchsia-800 text-fuchsia-700 dark:text-fuchsia-300',
      text1: 'text-fuchsia-700 dark:text-fuchsia-300',
      text2: 'text-fuchsia-600 dark:text-fuchsia-400'
    },
    teal: {
      card: 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 hover:bg-teal-100 dark:hover:bg-teal-900/30',
      title: 'text-teal-800 dark:text-teal-200',
      badge: 'bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300',
      text1: 'text-teal-700 dark:text-teal-300',
      text2: 'text-teal-600 dark:text-teal-400'
    },
    violet: {
      card: 'bg-violet-50 dark:bg-violet-900/20 border-violet-500 hover:bg-violet-100 dark:hover:bg-violet-900/30',
      title: 'text-violet-800 dark:text-violet-200',
      badge: 'bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-300',
      text1: 'text-violet-700 dark:text-violet-300',
      text2: 'text-violet-600 dark:text-violet-400'
    },
    red: {
      card: 'bg-red-50 dark:bg-red-900/20 border-red-500 hover:bg-red-100 dark:hover:bg-red-900/30',
      title: 'text-red-800 dark:text-red-200',
      badge: 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300',
      text1: 'text-red-700 dark:text-red-300',
      text2: 'text-red-600 dark:text-red-400'
    },
    sky: {
      card: 'bg-sky-50 dark:bg-sky-900/20 border-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/30',
      title: 'text-sky-800 dark:text-sky-200',
      badge: 'bg-sky-100 dark:bg-sky-800 text-sky-700 dark:text-sky-300',
      text1: 'text-sky-700 dark:text-sky-300',
      text2: 'text-sky-600 dark:text-sky-400'
    },
    cyan: {
      card: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 hover:bg-cyan-100 dark:hover:bg-cyan-900/30',
      title: 'text-cyan-800 dark:text-cyan-200',
      badge: 'bg-cyan-100 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-300',
      text1: 'text-cyan-700 dark:text-cyan-300',
      text2: 'text-cyan-600 dark:text-cyan-400'
    },
    pink: {
      card: 'bg-pink-50 dark:bg-pink-900/20 border-pink-500 hover:bg-pink-100 dark:hover:bg-pink-900/30',
      title: 'text-pink-800 dark:text-pink-200',
      badge: 'bg-pink-100 dark:bg-pink-800 text-pink-700 dark:text-pink-300',
      text1: 'text-pink-700 dark:text-pink-300',
      text2: 'text-pink-600 dark:text-pink-400'
    },
    orange: {
      card: 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30',
      title: 'text-orange-800 dark:text-orange-200',
      badge: 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300',
      text1: 'text-orange-700 dark:text-orange-300',
      text2: 'text-orange-600 dark:text-orange-400'
    }
  };

  return colors[color] || colors.blue;
};

export default function ClassCard({ code, type, section, room, teacher, color }) {
  const styles = getCardColors(color);

  return (
    <div className="p-0.5 h-full z-10">
      <div className={`${styles.card} border-l-[3px] rounded-[2px] p-1.5 h-full transition-colors flex flex-col justify-between overflow-hidden relative z-10 bg-white/50 backdrop-blur-[2px] dark:bg-slate-900/50`}>
        <div className="flex justify-between items-start gap-1">
          <span className={`${styles.title} text-[11px] font-extrabold leading-none`}>
            {code}
          </span>
          <span className={`${styles.badge} text-[10px] font-bold px-1 py-0.5 rounded-[2px]`}>
            {type}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 leading-none mt-1">
          <div className={`${styles.text1} flex justify-between text-[10px]`}>
            <span>{section}</span>
            <span>{room}</span>
          </div>
          <div className={`${styles.text2} flex items-center gap-0.5 text-[10px] mt-0.5`}>
            <span className="material-symbols-outlined text-[12px]">person</span>
            <span className="truncate">{teacher}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
