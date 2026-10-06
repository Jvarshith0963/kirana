function Button({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700"
    >
      {children}
    </button>
  )
}

export default Button