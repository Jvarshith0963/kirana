function Card({ children }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      {children}
    </div>
  )
}

export default Card