import * as Minio from 'minio'

export const minioClient = new Minio.Client({
  endPoint: '120.46.201.4',
  port: 10201,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: '@Dwl1234567890',
})