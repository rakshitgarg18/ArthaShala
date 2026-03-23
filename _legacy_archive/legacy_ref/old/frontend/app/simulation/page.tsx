"use client";
import React, {useState, useEffect, useRef} from 'react'
import Link from "next/link";
import { usePathname } from "next/navigation";
import _Render_ from "../three/main.js";

function Simulation() {
  const pathname = usePathname();
    const linkClasses = (path: string) =>
    `px-5 py-2 rounded-full transition-all duration-300 ${
      pathname === path
        ? "bg-blue-500 text-white"
        : "text-gray-300 hover:bg-gray-700"
    }`;

  return (

    <main className="min-h-screen bg-gray-900 text-white">
      <div className="flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center py-4 border-b border-gray-700">
        {/* Left logo */}
        <h1 className="absolute left-8 text-xl font-bold">Nexora</h1>

        {/* Center nav */}
        <div className="mx-auto flex gap-4 bg-gray-800 p-2 rounded-full">
          <Link href="/simulation" className={linkClasses("/stimulation")}>
            Simulation
          </Link>

          <Link href="/teaching" className={linkClasses("/teaching")}>
            Teaching
          </Link>
        </div>
      </nav>
        <div className="w-full">
        <SimElement/>
        </div>
      </div>
    </main>
  );
}

function SimElement({state_for_ref}){
  let SimElement_ref = useRef();

  useEffect(()=>{
    _Render_(SimElement_ref.current);
  }, []);

  return (
  <>
      <div
        ref={SimElement_ref}
        className="simElement">
      
      </div>
  </>
  );
}

export default Simulation
 
