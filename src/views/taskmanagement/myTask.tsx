import { Plus, Trash2 } from 'lucide-react'

const MyTask = () => {
  return (
    <section className='h-[85vh] relative'>
       
        <div className='md:p-6 h-[490px] overflow-y-auto hide-scrollbar'>
            <div>
                <h1 className='text-2xl text-black font-bold mt-4'>Your Tasks</h1>
                <ul className='mt-1'>
                    <li className='flex  items-center border bg-white p-4 rounded-lg shadow-md gap-4 w-full'>
                        <input type="checkbox" className='mr-2' />
                        <p className='flex flex-col'>
                            <span className='text-gray-700'>Complete the project documentation</span>
                        <span className='text-gray-400 text-sm'>2026-02-27</span>
                        </p>
                    </li>

                    <li className='flex mt-3 items-center border bg-white p-4 rounded-lg shadow-md gap-4 w-full'>
                        <input type="checkbox" className='mr-2' />
                        <p className='flex flex-col'>
                            <span className='text-gray-700'>Complete the project documentation</span>
                        <span className='text-gray-400 text-sm'>2026-02-27</span>
                        </p>
                    </li>
                    <li className='flex mt-3 items-center border bg-white p-4 rounded-lg shadow-md gap-4 w-full'>
                        <input type="checkbox" className='mr-2' />
                        <p className='flex flex-col'>
                            <span className='text-gray-700'>Complete the project documentation</span>
                        <span className='text-gray-400 text-sm'>2026-02-27</span>
                        </p>
                    </li>
                </ul>
            </div>
            <div>
                <h1 className='text-2xl text-black font-bold mt-6'>Completed Tasks</h1>
                <ul className='mt-1'>
                    <li className='flex justify-between items-center border bg-white p-4 rounded-lg shadow-md gap-4 w-full'>
                        <p className='flex flex-col'>
                            <del className='text-gray-400'>Complete the project documentation</del>
                        <span className='text-gray-400 text-sm'>2026-02-27</span>
                        </p>
                        <div>
                            <Trash2 size={22} color='red'/>
                        </div>
                    </li>
                    <li className='flex mt-3 justify-between items-center border bg-white p-4 rounded-lg shadow-md gap-4 w-full'>
                        <p className='flex flex-col'>
                            <del className='text-gray-400'>Complete the project documentation</del>
                        <span className='text-gray-400 text-sm'>2026-02-27</span>
                        </p>
                        <div>
                            <Trash2 size={22} color='red'/>
                        </div>
                    </li>
                    <li className='flex mt-3 justify-between items-center border bg-white p-4 rounded-lg shadow-md gap-4 w-full'>
                        <p className='flex flex-col'>
                            <del className='text-gray-400'>Complete the project documentation</del>
                        <span className='text-gray-400 text-sm'>2026-02-27</span>
                        </p>
                        <div>
                            <Trash2 size={22} color='red'/>
                        </div>
                    </li>
                </ul>
            </div>
           <div className="absolute bottom-1 left-0 w-full bg-slate-200 h-14 rounded-full overflow-hidden shadow-lg border border-gray-300">
        <input
          type="text"
          placeholder="Add tasks..."
          className="rounded-md h-14 px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center"><Plus size={22}/>Add</button>
      </div>
        </div>
    </section>
  )
}

export default MyTask