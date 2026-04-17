package main

import (
	"fmt"
	"image"
	_ "image/gif"
	"image/jpeg"
	_ "image/png"
	"os"
	"path/filepath"
)

func main() {
	root := "html/images"
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}

		ext := filepath.Ext(path)
		if ext == ".jpg" || ext == ".jpeg" {
			fmt.Printf("Optimizing: %s (Size: %.2f MB)\n", path, float64(info.Size())/(1024*1024))
			
			// 读取并解码
			file, err := os.Open(path)
			if err != nil {
				return err
			}
			img, _, err := image.Decode(file)
			file.Close()
			if err != nil {
				fmt.Printf("  Skipping (Decode error): %v\n", err)
				return nil
			}

			// 覆盖写回，质量设为 70%
			outFile, err := os.Create(path)
			if err != nil {
				return err
			}
			err = jpeg.Encode(outFile, img, &jpeg.Options{Quality: 70})
			outFile.Close()
			if err != nil {
				fmt.Printf("  Skipping (Encode error): %v\n", err)
				return nil
			}
			
			newInfo, _ := os.Stat(path)
			fmt.Printf("  Done. New Size: %.2f MB\n", float64(newInfo.Size())/(1024*1024))
		}
		return nil
	})

	if err != nil {
		fmt.Printf("Error: %v\n", err)
	} else {
		fmt.Println("Batch optimization complete.")
	}
}
