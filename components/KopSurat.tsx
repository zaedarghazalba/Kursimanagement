'use client';

import Image from 'next/image';

export default function KopSurat() {
  return (
    <div className="flex items-center justify-between border-b-4 border-double border-black pb-4 mb-6">
      <div className="flex-shrink-0">
        <Image 
          src="/Tarakan.png" 
          alt="Logo Tarakan" 
          width={80} 
          height={80} 
          className="object-contain"
        />
      </div>
      
      <div className="flex-1 text-center px-4">
        <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide leading-tight">
          Pemerintah Kota Tarakan
        </h2>
        <h2 className="text-xl sm:text-2xl font-extrabold uppercase leading-tight">
          Dinas Pendidikan
        </h2>
        <h1 className="text-2xl sm:text-3xl font-black uppercase leading-tight mt-1">
          SMP Negeri 12 Tarakan
        </h1>
        <p className="text-xs sm:text-sm italic mt-2 font-medium">
          Alamat: Jl. Aki Balak RT. 13 Kel. Juata Kerikil Kec. Tarakan Utara
        </p>
      </div>
      
      <div className="flex-shrink-0">
        <Image 
          src="/SMP 12.png" 
          alt="Logo SMP 12" 
          width={80} 
          height={80} 
          className="object-contain"
        />
      </div>
    </div>
  );
}
