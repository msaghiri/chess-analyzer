export const PGNForm = ({}) => {
    return <div className="w-200 h-150 bg-gray-800 rounded-2xl flex flex-col gap-10 items-center p-10">
        <h2 className="text-white text-4xl">Input PGN</h2>
        <textarea className="bg-blue-900 rounded-2xl w-4/5 h-1/2 max-h-1/2 min-h-1/4 p-6 text-white resize-y"></textarea>
        <button className=" bg-gray-700 text-white w-1/2 h-12 rounded-2xl cursor-pointer transition-all duration-75 hover:bg-blue-500">Analyze</button>
    </div>
}