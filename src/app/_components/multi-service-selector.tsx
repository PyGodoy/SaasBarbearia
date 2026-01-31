// app/_components/multi-service-selector.tsx
"use client"

import { Barbershop, BarbershopService } from "@prisma/client"
import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "./ui/sheet"
import { Calendar } from "./ui/calendar"
import { ptBR } from "date-fns/locale"
import { useEffect, useMemo } from "react"
import { isPast, isToday, set } from "date-fns"
import { createBooking } from "../_actions/create-booking"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { getBookings } from "../_actions/get-bookings"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"
import Image from "next/image"

interface MultiServiceSelectorProps {
  barbershop: Pick<Barbershop, "name" | "id" | "maxClientsPerSlot">
  services: (BarbershopService & { maxClients: number })[]
}

const TIME_LIST = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00",
]

const MultiServiceSelector = ({ barbershop, services }: MultiServiceSelectorProps) => {
  const { data } = useSession()
  const router = useRouter()
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [dayBookings, setDayBookings] = useState<any[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showServiceList, setShowServiceList] = useState(false)

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const selectedServicesData = services.filter(service => 
    selectedServices.includes(service.id)
  )

  const totalPrice = selectedServicesData.reduce((total, service) => 
    total + Number(service.price), 0
  )

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedDay) return
      
      try {
        const bookings = await getBookings({
          date: selectedDay,
          barbershopId: barbershop.id,
        })
        setDayBookings(bookings)
      } catch (error) {
        console.error("Erro ao buscar bookings:", error)
        setDayBookings([])
      }
    }
    
    fetchBookings()
  }, [selectedDay, barbershop.id])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return set(selectedDay, {
      hours: Number(selectedTime.split(":")[0]),
      minutes: Number(selectedTime.split(":")[1]),
    })
  }, [selectedDay, selectedTime])

  const timeList = useMemo(() => {
    if (!selectedDay) return []
    
    return TIME_LIST.filter((time) => {
      const hour = Number(time.split(":")[0])
      const minutes = Number(time.split(":")[1])

      const timeIsOnThePast = isPast(set(new Date(), { hours: hour, minutes }))
      if (timeIsOnThePast && isToday(selectedDay)) {
        return false
      }

      const bookingsCount = dayBookings.filter(
        (booking) =>
          booking.date.getHours() === hour &&
          booking.date.getMinutes() === minutes
      ).length

      return bookingsCount < barbershop.maxClientsPerSlot
    })
  }, [dayBookings, selectedDay, barbershop.maxClientsPerSlot])

  const handleBookingClick = () => {
    if (selectedServices.length === 0) {
      toast.error("Selecione pelo menos um serviço")
      return
    }

    if (data?.user) {
      return setBookingSheetIsOpen(true)
    }
    return setSignInDialogIsOpen(true)
  }

  const handleCreateBooking = async () => {
    if (!selectedDate || selectedServices.length === 0) return
    
    setLoading(true)
    try {
      await createBooking({
        serviceIds: selectedServices,
        date: selectedDate,
        barbershopId: barbershop.id
      })
      
      setBookingSheetIsOpen(false)
      setSelectedServices([])
      setSelectedDay(undefined)
      setSelectedTime(undefined)
      
      toast.success("Reserva criada com sucesso!", {
        action: {
          label: "Ver agendamentos",
          onClick: () => router.push("/bookings"),
        },
      })
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar reserva!")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleServiceList = () => {
    setShowServiceList(!showServiceList)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Botão para abrir seleção múltipla */}
        <Button onClick={handleToggleServiceList} className="w-full">
          Clique Para Selecionar Múltiplos Serviços
        </Button>

        {/* Lista de serviços para seleção - agora controlada pelo estado showServiceList */}
        {showServiceList && (
          <div className="space-y-3">
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <Checkbox
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                  />
                  
                  <div className="relative max-h-[80px] min-h-[80px] min-w-[80px] max-w-[80px]">
                    <Image
                      alt={service.name}
                      src={service.imageUrl}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  
                  <div className="space-y-1 flex-1">
                    <h3 className="text-sm font-semibold">{service.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{service.description}</p>
                    <p className="text-sm font-bold text-primary">
                      {Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(Number(service.price))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Botão para confirmar seleção e prosseguir */}
            {selectedServices.length > 0 && (
              <Button onClick={handleBookingClick} className="w-full">
                Prosseguir com {selectedServices.length} serviço{selectedServices.length > 1 ? 's' : ''} selecionado{selectedServices.length > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Sheet de reserva */}
      <Sheet open={bookingSheetIsOpen} onOpenChange={setBookingSheetIsOpen}>
        <SheetContent className="px-0">
          <SheetHeader>
            <SheetTitle>Reservar Serviços Selecionados</SheetTitle>
          </SheetHeader>

          {/* Resumo dos serviços selecionados */}
          <div className="p-5 border-b">
            <h3 className="font-semibold mb-3">Serviços selecionados:</h3>
            {selectedServicesData.map(service => (
              <div key={service.id} className="flex justify-between text-sm mb-2">
                <span>• {service.name}</span>
                <span>
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(service.price))}
                </span>
              </div>
            ))}
            <div className="flex justify-between font-bold mt-3 border-t pt-2">
              <span>Total:</span>
              <span className="text-primary">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalPrice)}
              </span>
            </div>
          </div>

          {/* Calendário */}
          <div className="border-b border-solid py-5">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={selectedDay}
              onSelect={setSelectedDay}
              disabled={{ before: new Date() }}
            />
          </div>

          {/* Horários */}
          {selectedDay && (
            <div className="flex gap-3 overflow-x-auto border-b border-solid p-5 [&::-webkit-scrollbar]:hidden">
              {timeList.length > 0 ? (
                timeList.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))
              ) : (
                <p className="text-xs">Não há horários disponíveis para este dia.</p>
              )}
            </div>
          )}

          <SheetFooter className="mt-5 px-5">
            <Button 
              onClick={handleCreateBooking} 
              disabled={!selectedDay || !selectedTime || selectedServices.length === 0 || loading}
              className="w-full"
            >
              {loading ? "Criando reserva..." : `Confirmar Reserva - ${Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalPrice)}`}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={signInDialogIsOpen} onOpenChange={setSignInDialogIsOpen}>
        <DialogContent className="w-[90%]">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MultiServiceSelector