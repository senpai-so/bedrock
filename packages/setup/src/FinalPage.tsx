import { Page } from './components/Page'

function FinalPage() {
  const finish = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }
    fetch('http://localhost:3001/admin/startDev', requestOptions)
      .then((res) => res.json())
      .then((res) => {
        console.log('Local dApp running on port 3002!')
        console.info('Redirecting...')
        window.location.href = 'http://localhost:3002'
        process.exit(0)
      })
      .catch((e) => console.log(e))
  }

  return (
    <div
      className='h-screen'
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover'
      }}
    >
      <Page>
        <div className='bg-white max-w-2xl mx-auto rounded-3xl shadow-2xl px-5 py-12'>
          <div className='flex flex-col items-center justify-center space-y-4'>
            <div className='flex flex-col items-center justify-center space-y-4'>
              <div className='flex flex-col items-center justify-center border-gray-200 rounded-lg p-4'>
                <h2 className='font-bold text-center text-3xl text-blue-700'>
                  Complete!
                </h2>

                <p className='text-base font-medium text-center text-gray-700'>
                  Your collection has been launched!
                </p>
              </div>
              <div className='items-center justify-center'>
                <button
                  className='mr-0 items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-700 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  onClick={finish}
                >
                  View Demo Site
                </button>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </div>
  )
}

export default FinalPage
