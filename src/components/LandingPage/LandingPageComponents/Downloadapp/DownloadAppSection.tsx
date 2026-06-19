import bgDesktop from '../../../../assets/images/download_banner.png';
import bgMobile from '../../../../assets/images/image.webp';

function Content() {
  return (
    <div className="relative z-10 flex flex-col items-center lg:items-start w-full  mx-auto text-center lg:text-left">
      <div className="w-full lg:w-1/2">
        <h2 className="text-4xl md:text-6xl font-black mb-6 text-slate-900 leading-tight tracking-tight">
          Get The <span className="text-indigo-600">Learning App</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl font-medium leading-relaxed">
          Download lessons and learn anytime, anywhere with the MindShaala app. Experience premium education at your fingertips.
        </p>
        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
          <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-14" />
          </a>
          <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
            <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" className="h-14" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function DownloadAppSection() {
  return (
    <section className="relative w-full font-poppins">
      <div className="md:hidden min-h-[350px] flex items-center px-4 py-8 bg-cover bg-center" style={{ backgroundImage: `url(${bgMobile})` }}>
        <Content />
      </div>
      <div className="hidden md:flex min-h-[600px] items-center px-4 bg-cover bg-center" style={{ backgroundImage: `url(${bgDesktop})` }}>
        <Content />
      </div>
    </section>
  );
}
