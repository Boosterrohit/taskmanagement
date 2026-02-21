import { useRef, useState } from "react"
import { Play, Pause } from "lucide-react"
import video from "../../assets/video.mp4"

const Work = () => {
 const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  return (
    <section className="work_background">
    <div className="max-w-7xl mx-auto md:px-10 px-5 pt-20 pb-5">
      <p className="text-[#155dfc] font-semibold text-center uppercase">
        See it in action
      </p>

      <h1 className="md:text-5xl text-2xl text-center font-semibold py-5 text-black">
        Watch how it works
      </h1>

      <p className="text-center md:text-xl text-sm text-gray-500">
        See how easy it is to organize your tasks and boost your productivity
      </p>

      <div className="w-full mt-14  rounded-2xl overflow-hidden relative flex items-center justify-center">

        {/* Overlay (only when NOT playing) */}
        {!isPlaying && (
          <div className="absolute h-auto inset-0 bg-black/40 z-10 transition-opacity duration-500"></div>
        )}

        {/* Play Button */}
        <button
          onClick={togglePlay}
          className="absolute z-20  bg-white/90 p-5 rounded-full shadow-lg hover:scale-110 transition"
        >
          {isPlaying ? <Pause size={34} /> : <Play size={34} />}
        </button>

        {/* Video */}
        <video
          ref={videoRef}
          className="w-full md:h-[600px] object-cover"
        >
          <source src={video} type="video/mp4" />
        </video>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 justify-center items-center">
        <div className="text-center">
          <h3 className="text-4xl text-[#155dfc] font-semibold">2 Min</h3>
          <p className="text-gray-600 text-sm">Quick Setup</p>
        </div>
        <div className="text-center">
          <h3 className="text-4xl text-[#155dfc] font-semibold">50K+</h3>
          <p className="text-gray-600 text-sm">Active Users</p>
        </div>
        <div className="text-center">
          <h3 className="text-4xl text-[#155dfc] font-semibold">2M+</h3>
          <p className="text-gray-600 text-sm">Tasks Completed</p>
        </div>

      </div>
    </div>
    </section>
  )
}

export default Work