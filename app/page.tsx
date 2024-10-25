'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface CryptoData {
  date: string
  price: string
}

interface CurrentPrices {
  [key: string]: number
}

const CryptoCalculator = () => {
  const [cryptoData, setCryptoData] = useState<{ [key: string]: CryptoData[] }>({})
  const [currentPrices, setCurrentPrices] = useState<CurrentPrices>({})
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC')
  const [purchaseDate, setPurchaseDate] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [result, setResult] = useState<{
    amountPurchased: number
    currentValue: number
    profitLoss: number
    profitLossPercentage: number
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const cryptos = ['BTC', 'SOL', 'ETHER', 'BNB']
      const data: { [key: string]: CryptoData[] } = {}
      
      for (const crypto of cryptos) {
        const response = await fetch(`/data/${crypto.toLowerCase()}.json`)
        data[crypto] = await response.json()
      }
      
      setCryptoData(data)

      const pricesResponse = await fetch('/data/current-prices.json')
      setCurrentPrices(await pricesResponse.json())
    }

    fetchData()
  }, [])

  const calculateInvestment = () => {
    const historicalData = cryptoData[selectedCrypto]
    const purchasePrice = historicalData.find(data => {
      const [month, day, year] = data.date.split('/')
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      return formattedDate === purchaseDate
    })

    if (!purchasePrice) {
      alert('No historical data available for the selected date.')
      return
    }

    const amountPurchased = parseFloat(amount) / parseFloat(purchasePrice.price)
    const currentValue = amountPurchased * currentPrices[selectedCrypto]
    const profitLoss = currentValue - parseFloat(amount)
    const profitLossPercentage = (profitLoss / parseFloat(amount)) * 100

    setResult({
      amountPurchased,
      currentValue,
      profitLoss,
      profitLossPercentage
    })
  }

  const handlePurchaseDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPurchaseDate(e.target.value)
  }

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Crypto Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Cryptocurrency</label>
              <Select onValueChange={setSelectedCrypto} defaultValue={selectedCrypto}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="ETHER">ETHER</SelectItem>
                  <SelectItem value="BNB">BNB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <Input
                type="date"
                id="purchaseDate"
                value={purchaseDate}
                onChange={handlePurchaseDateChange}
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
              <Input
                type="number"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount in USD"
              />
            </div>
            <Button onClick={calculateInvestment} className="w-full">Calculate</Button>
          </div>
          {result && (
            <div className="mt-4 space-y-2">
              <p><strong>Amount of crypto purchased:</strong> {result.amountPurchased.toFixed(8)} {selectedCrypto}</p>
              <p><strong>Current value:</strong> ${result.currentValue.toFixed(2)}</p>
              <p>
                <strong>
                  {result.profitLoss >= 0 ? (
                    <span className="text-green-600">Profit:</span>
                  ) : (
                    <span className="text-red-600">Loss:</span>
                  )}
                </strong>
                {' '}
                {Math.abs(result.profitLossPercentage).toFixed(2)}% (${Math.abs(result.profitLoss).toFixed(2)})
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CryptoCalculator