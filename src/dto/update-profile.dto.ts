import { IsNotEmpty, IsString, MinLength,IsOptional } from 'class-validator'




export class UpdateProfileDto {
    @IsOptional()
    @IsNotEmpty({ message: 'firstname must not be empty' })
    @IsString({ message: "firstname must be a string" })
    readonly firstname?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'lastname must not be empty' })
    @IsString({ message: "lastname must be a string" })
    readonly lastname?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Password must not be empty' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    readonly password?: string;

    @IsNotEmpty({ message: 'userId must not be empty' })
    @IsString({ message: "userId must be a string" })
    readonly user:string
}