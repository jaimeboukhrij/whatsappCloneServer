import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { SeedService } from '../seed/seed.service'

async function bootstrap () {
  const app = await NestFactory.createApplicationContext(AppModule)
  const seedService = app.get(SeedService)

  await seedService.createSeed()

  console.log('✅ Seed ejecutado correctamente')
  await app.close()
}

bootstrap().catch((err) => {
  console.error('❌ Error ejecutando el seed:', err)
})
