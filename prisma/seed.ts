import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    const images = [
      "https://plus.unsplash.com/premium_photo-1661322688147-76db73c4f598?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1675686363507-22a8d0e11b4c?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1704455306925-1401c3012117?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400",
      "https://images.unsplash.com/photo-1740410643780-883b33ee1b86?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1682145288913-979906a9ebc8?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1675686363532-f4ad697ecb46?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1704455306251-b4634215d98f?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1675686363399-91ad6111f82d?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1740410643780-883b33ee1b86?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ];
    // Nomes criativos para as barbearias
    const creativeNames = [
      "OdontoVida Clínica Odontológica",
      "Sorrisso - Centro Odontológico",
      "DentalCare Premium",
      "Clínica Dental Excellence",
      "OdontoPro - Saúde Bucal",
      "SmilePlus Odontologia",
      "Centro Odontológico Sorriso Novo",
      "Clínica DentalHealth",
      "Odontologia Integrada Vita",
      "Perfect Smile Odontologia",
    ];

    // Endereços fictícios para as barbearias
    const addresses = [
      "Av. Paulista, 1500 - Bela Vista, São Paulo - SP",
      "Rua Augusta, 2450 - Jardins, São Paulo - SP",
      "Av. Brigadeiro Faria Lima, 3064 - Itaim Bibi, São Paulo - SP",
      "Rua Oscar Freire, 1200 - Cerqueira César, São Paulo - SP",
      "Av. das Nações Unidas, 4777 - Vila Olímpia, São Paulo - SP",
      "Rua Haddock Lobo, 595 - Cerqueira César, São Paulo - SP",
      "Av. Angélica, 2530 - Consolação, São Paulo - SP",
      "Rua Teodoro Sampaio, 1020 - Pinheiros, São Paulo - SP",
      "Av. Europa, 158 - Jardim Europa, São Paulo - SP",
      "Rua Bela Cintra, 756 - Consolação, São Paulo - SP",
    ];

    const services = [
      {
        name: "Consulta de Avaliação",
        description: "Avaliação completa da saúde bucal com exame clínico detalhado.",
        price: 120.0,
        imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=300", // Dentista examinando paciente
      },
      {
        name: "Limpeza Dental (Profilaxia)",
        description: "Remoção de placa bacteriana e tártaro para manter a saúde bucal.",
        price: 150.0,
        imageUrl: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=300", // Instrumentos de limpeza
      },
      {
        name: "Restauração em Resina",
        description: "Tratamento de cáries com material estético de alta qualidade.",
        price: 180.0,
        imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300", // Tratamento dentário
      },
      {
        name: "Clareamento Dental",
        description: "Procedimento para deixar os dentes mais brancos e brilhantes.",
        price: 450.0,
        imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=300", // Sorriso branco
      },
      {
        name: "Extração Dentária",
        description: "Remoção segura de dentes comprometidos ou inclusos.",
        price: 200.0,
        imageUrl: "https://images.unsplash.com/photo-1739902526173-06750b78cfb7?q=80&w=300&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Instrumentos cirúrgicos
      },
      {
        name: "Canal (Endodontia)",
        description: "Tratamento de canal para salvar dentes com polpa comprometida.",
        price: 380.0,
        imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300", // Procedimento endodôntico
      },
      {
        name: "Prótese Dentária",
        description: "Reposição de dentes perdidos com próteses personalizadas.",
        price: 850.0,
        imageUrl: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=300", // Prótese dental
      },
      {
        name: "Implante Dentário",
        description: "Reposição de raiz dentária com parafuso de titânio.",
        price: 1200.0,
        imageUrl: "https://images.unsplash.com/photo-1590424693420-634a0b0b782c?q=80&w=300&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Implante dental
      },
      {
        name: "Ortodontia (Aparelho)",
        description: "Correção do posicionamento dos dentes e mordida.",
        price: 320.0,
        imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=300", // Aparelho ortodôntico
      },
      {
        name: "Periodontia",
        description: "Tratamento de doenças da gengiva e estruturas de suporte.",
        price: 280.0,
        imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=300", // Tratamento periodontal
      },
    ];

    // Criar 10 barbearias com nomes e endereços fictícios
    const barbershops = [];
    for (let i = 0; i < 10; i++) {
      const name = creativeNames[i];
      const address = addresses[i];
      const imageUrl = images[i];

      const barbershop = await prisma.barbershop.create({
        data: {
          name,
          address,
          imageUrl: imageUrl,
          phones: ["(11) 99999-9999", "(11) 99999-9999"],
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ac augue ullamcorper, pharetra orci mollis, auctor tellus. Phasellus pharetra erat ac libero efficitur tempus. Donec pretium convallis iaculis. Etiam eu felis sollicitudin, cursus mi vitae, iaculis magna. Nam non erat neque. In hac habitasse platea dictumst. Pellentesque molestie accumsan tellus id laoreet.",
        },
      });

      for (const service of services) {
        await prisma.barbershopService.create({
          data: {
            name: service.name,
            description: service.description,
            price: service.price,
            barbershop: {
              connect: {
                id: barbershop.id,
              },
            },
            imageUrl: service.imageUrl,
          },
        });
      }

      barbershops.push(barbershop);
    }

    // Fechar a conexão com o banco de dados
    await prisma.$disconnect();
  } catch (error) {
    console.error("Erro ao criar as barbearias:", error);
  }
}

seedDatabase();