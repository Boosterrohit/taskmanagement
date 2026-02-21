import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { FEATURE_LIST } from "@/data"

const Feature = () => {
  return (
    <div className="max-w-7xl mx-auto md:px-10 px-5 py-20">
        <p className="text-[#155dfc] font-semibold text-center uppercase">Features</p>
        <h1 className="md:text-5xl text-2xl text-center font-semibold py-6 text-black">Everything you need to stay productive</h1>
        <p className="text-center md:text-xl text-sm flex flex-col text-gray-500"><span>
          Powerful features wrapped in a simple interface. Focus on what matters—getting
          </span> 
          <span>
            things done.
          </span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
            {FEATURE_LIST.map((feature) => {
              return (
                <Card className="mx-auto w-full max-w-sm hover:border-blue-300 hover:shadow-xl transition-all duration-500">
                  <CardHeader>
                    <div className="bg-[#bedbff] w-fit p-2 rounded-md shadow-sm">
                      <feature.icons className="h-6 w-6 text-blue-700" />
                    </div>
                    <CardTitle className="text-xl py-4 font-semibold">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
    </div>
  )
}

export default Feature