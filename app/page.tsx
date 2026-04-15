"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      router.replace('/search');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen bg-black text-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-indigo-600" />
    </div>
  );
}