import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 })
    }

    // Verificar se é imagem
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Arquivo não é uma imagem' }, { status: 400 })
    }

    // Verificar tamanho (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagem muito grande (máximo 5MB)' }, { status: 400 })
    }

    // Criar nome único para o arquivo
    const fileExtension = image.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    
    // Caminho para salvar no projeto
    const uploadDir = join(process.cwd(), 'public', 'services', 'uploads')

    // Criar diretório se não existir
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error('Erro ao criar diretório:', error)
      return NextResponse.json({ error: 'Erro ao criar diretório' }, { status: 500 })
    }

    // Converter File para Buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Salvar arquivo
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    // Retornar URL da imagem
    const imageUrl = `/services/uploads/${fileName}`

    return NextResponse.json({ 
      success: true, 
      imageUrl 
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Adicione também o método OPTIONS para CORS (importante para desenvolvimento)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}