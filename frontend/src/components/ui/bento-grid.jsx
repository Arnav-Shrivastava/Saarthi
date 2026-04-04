import { cn } from "@/lib/utils"

function BentoGrid({ items = [], className = '' }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-3 p-4 max-w-7xl mx-auto", className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "group relative p-4 rounded-xl overflow-hidden transition-all duration-300",
            "border border-gray-100/80 bg-white",
            "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)]",
            "hover:-translate-y-0.5 will-change-transform",
            item.colSpan === 2 ? "md:col-span-2" : "col-span-1",
            item.hasPersistentHover && "shadow-[0_2px_12px_rgba(0,0,0,0.03)] -translate-y-0.5",
          )}
        >
          <div className={`absolute inset-0 ${item.hasPersistentHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
          </div>
          <div className="relative flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 group-hover:bg-gradient-to-br transition-all duration-300">
                {item.icon}
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm bg-black/5 text-gray-600 transition-colors duration-300 group-hover:bg-black/10">
                {item.status || "Active"}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 tracking-tight text-[15px]">
                {item.title}
                {item.meta && <span className="ml-2 text-xs text-gray-500 font-normal">{item.meta}</span>}
              </h3>
              <p className="text-sm text-gray-600 leading-snug">{item.description}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {item.tags?.map((tag, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-black/5 backdrop-blur-sm transition-all duration-200 hover:bg-black/10">
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.cta || "Explore →"}
              </span>
            </div>
          </div>
          <div className={`absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent ${item.hasPersistentHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`} />
        </div>
      ))}
    </div>
  )
}

export { BentoGrid }
